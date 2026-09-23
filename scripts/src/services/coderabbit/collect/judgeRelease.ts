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
import { ASSESSMENT_MARKER, RISK_MARKER } from "#src/services/coderabbit/feedback/constants";
import { getFeedbackReport } from "#src/services/coderabbit/feedback/getFeedbackReport";
import { getLatestMarkedBlock } from "#src/services/coderabbit/feedback/getLatestMarkedBlock";
import { readUnresolvedThreads } from "#src/services/coderabbit/feedback/readUnresolvedThreads";
import { CODERABBIT_REST_LOGIN } from "#src/services/coderabbit/shared/constants";
import { getSortedByUpdatedAt } from "#src/services/coderabbit/shared/getSortedByUpdatedAt";
import { runGit } from "#src/services/shared/runGit";
import { withFinalizerAsync } from "@esposter/shared";
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

// A clean review the bot rates above the least risk — or does not rate at all — is judged, once per head: the
// Level is the bot's impression across every round and does not reset when its concerns are answered, so whether
// Anything real is left is a reading of the rationale against the tree — the one thing here only a session can
// Do, and the only reading there is when the bot wrote no rationale. The verdict is recorded
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
  unreviewedFromSha,
  viewerLogin,
}: ReleaseVerdictInput): Promise<CycleOutcome | undefined> => {
  const marker = getMarker(VERDICT_MARKER, developSha);
  // A merge merges; a hold ports on, which is no outcome of this step's
  const applyVerdict = (verdict: ReleaseVerdict) =>
    verdict === ReleaseVerdict.Merge ? mergeReleasePullRequest({ developSha, isDryRun, pullRequest }) : undefined;
  const recorded = issueComments.findLast((comment) => checkIsMarked(comment, viewerLogin, marker));
  if (recorded) {
    const { reason, verdict } = getReleaseVerdict(recorded.body.slice(recorded.body.indexOf(marker) + marker.length));
    console.info(`release verdict at ${developSha} recorded: ${verdict} — ${reason}`);
    return applyVerdict(verdict);
  }
  // The level when the bot stated one for this head, and its silence when it did not — a clean review is judged
  // Either way, and what is written on the pull request says which of the two the judgement answered
  const statedRisk =
    level === undefined
      ? "the bot stated no merge risk for it"
      : unreviewedFromSha === undefined
        ? `the bot rates the merge risk _${level}_, above _${MERGEABLE_RISK_LEVEL}_`
        : `the bot last rated the merge risk _${level}_, before the head it skipped`;
  const reviewedState =
    unreviewedFromSha === undefined
      ? `The review at ${developSha} left nothing open`
      : `The bot skipped the review at ${developSha}, the reviews up to ${unreviewedFromSha} left nothing open,`;
  if (isDryRun) {
    console.info(`would judge the release at ${developSha} — ${statedRisk}`);
    return undefined;
  }
  // Read the way the feedback report reads the same block: oldest first by `updated_at`, because the walkthrough
  // Carrying it is edited in place across reviews and its position among the comments never moves with it
  // (`getSortedByUpdatedAt`), and through the reader that already knows the block is not always in the newest
  // Comment. Two readers of one block that disagree on which comment holds it is one of them being wrong.
  const botBodies = getSortedByUpdatedAt(issueComments.filter(({ user }) => user.login === CODERABBIT_REST_LOGIN)).map(
    ({ body }) => body,
  );
  // The rationale only where the level came with it: `level` is undefined for a block naming an older head as
  // Much as for no block at all, and that block is the bot's reading of code the fixes have already changed.
  // Both read the change assessment instead — the block the bot writes every time, and the one the gate and the
  // Prompt below already say they were handed whenever the level is missing. A skipped head is the exception the
  // Caller makes: no block will ever name it, so the level arrives with the older block it came from
  const riskBlock =
    (level === undefined
      ? getLatestMarkedBlock(botBodies, ASSESSMENT_MARKER)
      : getLatestMarkedBlock(botBodies, RISK_MARKER)) ?? "";
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
      `${marker} ${verdict} — ${reason}\n${reviewedState} and ${statedRisk}. ${
        verdict === ReleaseVerdict.Merge
          ? "Nothing real is left, so the collector merges the release."
          : "Something real is left, so the release is a person's: merge this pull request, or close it to pause. The collector keeps porting meanwhile, and the next head is judged afresh."
      }`,
    );
    return applyVerdict(verdict);
  };
  // The same question, asked first of the text alone: a rationale the record already settles needs no
  // Session, and most heads are that one (`llm-delegation` skill). Asked ahead of the account's own limit
  // Because it spends none of it — a release the record settles merges through an outage that would hold
  // Every session behind it.
  // A skipped head carries commits no review read, which the text alone cannot speak for
  const gatedVerdict =
    unreviewedFromSha === undefined ? await readReleaseGate({ answers, feedback, riskBlock }) : undefined;
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
      const prompt = getVerdictPrompt({
        answers,
        developSha,
        feedback,
        level,
        riskBlock,
        unreviewedFromSha,
        verdictPath,
      });
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
