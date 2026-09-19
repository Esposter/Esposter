import type { CycleOutcome } from "#src/models/coderabbit/collect/CycleOutcome";
import type { ReleaseVerdictInput } from "#src/models/coderabbit/collect/ReleaseVerdictInput";
import type { ReleaseVerdictLine } from "#src/models/coderabbit/collect/ReleaseVerdictLine";

import { ReleaseVerdict } from "#src/models/coderabbit/collect/ReleaseVerdict";
import { SessionRole } from "#src/models/coderabbit/collect/SessionRole";
import { checkIsMarked } from "#src/services/coderabbit/collect/checkIsMarked";
import {
  DRAIN_VERDICT_PREFIX,
  DRAINS_MARKER,
  MERGEABLE_RISK_LEVEL,
  SessionRoleModelMap,
  VERDICT_FILE,
  VERDICT_MARKER,
} from "#src/services/coderabbit/collect/constants";
import { getAnsweredFindingLines } from "#src/services/coderabbit/collect/getAnsweredFindingLines";
import { getMarker } from "#src/services/coderabbit/collect/getMarker";
import { getReleaseVerdict } from "#src/services/coderabbit/collect/getReleaseVerdict";
import { getVerdictPrompt } from "#src/services/coderabbit/collect/getVerdictPrompt";
import { mergeReleasePullRequest } from "#src/services/coderabbit/collect/mergeReleasePullRequest";
import { postComment } from "#src/services/coderabbit/collect/postComment";
import { postDrainLimited } from "#src/services/coderabbit/collect/postDrainLimited";
import { readDrainLimitResetMs } from "#src/services/coderabbit/collect/readDrainLimitResetMs";
import { readReleaseGate } from "#src/services/coderabbit/collect/readReleaseGate";
import { runSession } from "#src/services/coderabbit/collect/runSession";
import { WALKTHROUGH_MARKERS } from "#src/services/coderabbit/feedback/constants";
import { getFeedbackReport } from "#src/services/coderabbit/feedback/getFeedbackReport";
import { getLatestMarkedBlock } from "#src/services/coderabbit/feedback/getLatestMarkedBlock";
import { readUnresolvedThreads } from "#src/services/coderabbit/feedback/readUnresolvedThreads";
import { CODERABBIT_REST_LOGIN } from "#src/services/coderabbit/shared/constants";
import { getSortedByUpdatedAt } from "#src/services/coderabbit/shared/getSortedByUpdatedAt";
import { runGit } from "#src/services/coderabbit/shared/runGit";
import { withFinalizerAsync } from "@esposter/shared";
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

// A clean review the bot rates above the least risk is judged, once per head: the level is the bot's impression
// Across every round and does not reset when its concerns are answered, so whether anything real is left is a
// Reading of the rationale against the tree — the one thing here only a session can do. The verdict is recorded
// On the pull request with the verb beside the marker, and a later run re-applies it rather than judging again:
// A `merge` whose `gh pr merge` failed merges now, a `hold` ports on. No outcome means the window ports as usual.
export const judgeRelease = async ({
  cwd,
  developSha,
  isDryRun,
  issueComments,
  level,
  pullRequest,
  reviews,
  viewerLogin,
}: ReleaseVerdictInput): Promise<CycleOutcome | undefined> => {
  const marker = getMarker(VERDICT_MARKER, developSha);
  const recorded = issueComments.findLast((comment) => checkIsMarked(comment, viewerLogin, marker));
  if (recorded) {
    const { reason, verdict } = getReleaseVerdict(recorded.body.slice(recorded.body.indexOf(marker) + marker.length));
    console.info(`release verdict at ${developSha} recorded: ${verdict} — ${reason}`);
    return verdict === ReleaseVerdict.Merge
      ? mergeReleasePullRequest({ developSha, isDryRun, pullRequest })
      : undefined;
  }

  if (isDryRun) {
    console.info(`would judge the release at ${developSha} — the bot rates the merge risk ${level}`);
    return undefined;
  }

  const [riskMarker = ""] = WALKTHROUGH_MARKERS;
  // Read the way the feedback report reads the same block: oldest first by `updated_at`, because the walkthrough
  // Carrying it is edited in place across reviews and its position among the comments never moves with it
  // (`getSortedByUpdatedAt`), and through the reader that already knows the block is not always in the newest
  // Comment. Two readers of one block that disagree on which comment holds it is one of them being wrong.
  const botBodies = getSortedByUpdatedAt(issueComments.filter(({ user }) => user.login === CODERABBIT_REST_LOGIN)).map(
    ({ body }) => body,
  );
  const riskBlock = getLatestMarkedBlock(botBodies, riskMarker) ?? "";
  const newestReview = reviews.findLast(({ body }) => body);
  const threads = readUnresolvedThreads(pullRequest);
  const feedback = newestReview
    ? getFeedbackReport({ issueComments, isThreadListed: true, review: newestReview, threads })
    : "No review on this pull request ever wrote a body.";
  // Both halves of what the pull request answered, which is the whole of what the question turns on: an inline
  // Rejection is a reply on its own thread, a body-only one a comment under the drains marker. Every other
  // Comment the collector wrote here is bookkeeping and is left out — feeding a gate the record of a drain that
  // Hit a limit is asking it to weigh a fact about the account against a concern about the code.
  const answers = [
    ...getAnsweredFindingLines(threads),
    ...issueComments.filter((comment) => checkIsMarked(comment, viewerLogin, DRAINS_MARKER)).map(({ body }) => body),
  ];
  // Recorded the same way whichever tier decided, so the verb beside the marker is what a later run
  // Re-applies and a person reads one shape either way
  const recordVerdict = ({ reason, verdict }: ReleaseVerdictLine): CycleOutcome | undefined => {
    console.info(`release verdict at ${developSha}: ${verdict} — ${reason}`);
    postComment(
      pullRequest,
      `${marker} ${verdict} — ${reason}\nThe review at ${developSha} left nothing open and the bot rates the merge risk _${level}_, above _${MERGEABLE_RISK_LEVEL}_. ${
        verdict === ReleaseVerdict.Merge
          ? "Nothing real is left, so the collector merges the release."
          : "Something real is left, so the release is a person's: merge this pull request, or close it to pause. The collector keeps porting meanwhile, and the next head is judged afresh."
      }`,
    );
    return verdict === ReleaseVerdict.Merge
      ? mergeReleasePullRequest({ developSha, isDryRun, pullRequest })
      : undefined;
  };
  // The same question, asked first of the text alone: a rationale the record already settles needs no
  // Session, and most heads are that one (`llm-delegation` skill). Asked ahead of the account's own limit
  // Because it spends none of it — a release the record settles merges through an outage that would hold
  // Every session behind it.
  const gatedVerdict = await readReleaseGate({ answers, feedback, riskBlock });
  if (gatedVerdict) return recordVerdict(gatedVerdict);

  // A limit the drain hit is the account's, not this head's: the window ports on and the next run judges
  const limitResetMs = readDrainLimitResetMs(issueComments, viewerLogin);
  if (limitResetMs !== undefined && limitResetMs > Date.now()) {
    console.info(
      `release verdict at ${developSha} waits — the session is limited until ${new Date(limitResetMs).toISOString()}`,
    );
    return undefined;
  }
  // The verdict outlives the session that wrote it only as far as the read below: the directory goes with the
  // Judgement, or every head judged leaves one behind
  const verdictDirectory = mkdtempSync(join(tmpdir(), DRAIN_VERDICT_PREFIX));
  const outcome = await withFinalizerAsync(
    async () => {
      const verdictPath = join(verdictDirectory, VERDICT_FILE);
      const prompt = getVerdictPrompt({ answers, developSha, feedback, level, riskBlock, verdictPath });
      // Read-only judgement over the head the verdict covers: no install, no checks
      runGit(["switch", "--detach", developSha], cwd);
      const { isEnded, isStarted, limitResetAtMs } = await runSession({
        cwd,
        model: SessionRoleModelMap[SessionRole.Verdict],
        prompt,
      });
      if (!isStarted) {
        if (limitResetAtMs !== undefined) postDrainLimited(pullRequest, limitResetAtMs);
        return undefined;
      }

      const verdictLine = getReleaseVerdict(
        isEnded && existsSync(verdictPath) ? readFileSync(verdictPath, "utf8") : "",
      );
      return recordVerdict(verdictLine);
    },
    () => {
      rmSync(verdictDirectory, { force: true, recursive: true });
    },
  );
  return outcome;
};
