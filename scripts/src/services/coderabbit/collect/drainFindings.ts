import type { DrainFindingsInput } from "#src/models/coderabbit/collect/DrainFindingsInput";

import { AttemptFailedError } from "#src/models/coderabbit/collect/AttemptFailedError";
import { SessionRole } from "#src/models/coderabbit/collect/SessionRole";
import { checkIsMarked } from "#src/services/coderabbit/collect/checkIsMarked";
import {
  DRAIN_FAILED_MARKER,
  DRAIN_VERDICT_PREFIX,
  REJECTIONS_FILE,
  REVIEW_FIXES_BRANCH,
  SESSION_ATTEMPT_CAP,
  SessionRoleModelMap,
  VERDICT_FILE,
} from "#src/services/coderabbit/collect/constants";
import { deferFindings } from "#src/services/coderabbit/collect/deferFindings";
import { getAttempts } from "#src/services/coderabbit/collect/getAttempts";
import { getDrainPrompt } from "#src/services/coderabbit/collect/getDrainPrompt";
import { getMarker } from "#src/services/coderabbit/collect/getMarker";
import { getUnansweredFindings } from "#src/services/coderabbit/collect/getUnansweredFindings";
import { postComment } from "#src/services/coderabbit/collect/postComment";
import { postDrainVerdicts } from "#src/services/coderabbit/collect/postDrainVerdicts";
import { readAnsweredCommits } from "#src/services/coderabbit/collect/readAnsweredCommits";
import { readDirtyPaths } from "#src/services/coderabbit/collect/readDirtyPaths";
import { readFindingSeverities } from "#src/services/coderabbit/collect/readFindingSeverities";
import { readHeadSha } from "#src/services/coderabbit/collect/readHeadSha";
import { runInstall } from "#src/services/coderabbit/collect/runInstall";
import { runSession } from "#src/services/coderabbit/collect/runSession";
import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { runGit } from "#src/services/shared/runGit";
import { withFinalizerAsync } from "@esposter/shared";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

// Claude works on the fixes branch — ai/review-fixes while it still owes develop commits, develop's head
// Otherwise — pushed only after a clean exit, so a drain that dies leaves no trace. Past the attempt cap the
// Findings are deferred rather than drained again: each is answered with why and listed in one issue, and the drain
// Is complete, so the walk goes on. Claude Code's own limit is the one non-zero exit that is not this review's
// Failure: its deadline goes into a marker comment every run reads until it lifts. Resolves to the fixes branch the
// Port reads — the one pushed, or the one it started from when nothing was.
export const drainFindings = async ({
  baseSha,
  collectorSha,
  issueComments,
  newestReviewId,
  reviewFixesSha,
  viewerLogin,
  ...drainInput
}: DrainFindingsInput): Promise<string | undefined> => {
  const { pullRequest } = drainInput;
  // Counted from the pull request's comments the caller already read, and recorded back to that pull request
  const { attempts, recordFailure } = getAttempts({
    collectorSha,
    comments: issueComments,
    key: newestReviewId,
    marker: DRAIN_FAILED_MARKER,
    post: (body) => {
      postComment(pullRequest, body);
    },
    viewerLogin,
  });
  if (attempts >= SESSION_ATTEMPT_CAP) {
    // The cause is the newest failure's own sentence, the line under the marker the count read (`getAttemptFailure`)
    const attemptMarker = getMarker(DRAIN_FAILED_MARKER, newestReviewId, [collectorSha]);
    const cause =
      issueComments
        .findLast((comment) => checkIsMarked(comment, viewerLogin, attemptMarker))
        ?.body.split("\n")
        .at(1) ?? "the drain session failed";
    // A dry run returns before the drain is reached (`runDrainStep`)
    deferFindings({ ...drainInput, attempts, cause, isDryRun: false, viewerLogin });
    return reviewFixesSha;
  }

  runGit(["switch", "--force-create", REVIEW_FIXES_BRANCH, baseSha]);
  // The tree the drain's own checks run against is this base, not the one the event checked out (`INSTALL_COMMAND`)
  const installFailure = runInstall(REPOSITORY_ROOT);
  // Outside the checkout, so the drain's "leave the working tree clean" and its verdicts never contend, and
  // Removed with the drain that made it — every run mints its own, and none of them is read again
  const verdictDirectory = mkdtempSync(join(tmpdir(), DRAIN_VERDICT_PREFIX));
  const fixesSha = await withFinalizerAsync(
    async () => {
      const rejectionsPath = join(verdictDirectory, REJECTIONS_FILE);
      const verdictPath = join(verdictDirectory, VERDICT_FILE);
      const commentIdSeverityMap = await readFindingSeverities(drainInput.openThreads);
      const promptInput = { ...drainInput, commentIdSeverityMap, installFailure, rejectionsPath, verdictPath };
      const prompt = getDrainPrompt(promptInput);
      const { isEnded } = await runSession({
        cwd: REPOSITORY_ROOT,
        model: SessionRoleModelMap[SessionRole.Drain],
        prompt,
      });
      // A zero exit says the session ended, never that it finished: a drain that stopped mid-fix leaves the rest in
      // The working tree, and reading `HEAD` there would push half a finding as though it were whole
      const dirtyPaths = readDirtyPaths();
      if (!isEnded || dirtyPaths.length > 0) {
        recordFailure(`drain review ${newestReviewId}`);
        throw new AttemptFailedError(
          isEnded
            ? `the drain left the working tree dirty:\n${dirtyPaths.join("\n")}`
            : "the drain step exited non-zero",
        );
      }

      const verdicts = postDrainVerdicts(promptInput);
      const headSha = readHeadSha();
      const commits = headSha === baseSha ? [] : readAnsweredCommits([`${baseSha}..${headSha}`]);
      // Pushed whether or not the drain answered everything: what it did fix is the next attempt's answered set
      if (headSha === baseSha) console.info("the drain produced no commit");
      else {
        // An empty expected sha leases on the branch not existing, which is the first drain's case
        runGit([
          "push",
          `--force-with-lease=refs/heads/${REVIEW_FIXES_BRANCH}:${reviewFixesSha ?? ""}`,
          "origin",
          `${headSha}:refs/heads/${REVIEW_FIXES_BRANCH}`,
        ]);
        console.info(`pushed ${REVIEW_FIXES_BRANCH} at ${headSha}`);
      }

      const unanswered = getUnansweredFindings({ ...verdicts, commits, ...drainInput });
      if (unanswered.length > 0) {
        const detail = `left ${unanswered.join(", ")} unanswered`;
        recordFailure(`drain review ${newestReviewId}`, detail);
        throw new AttemptFailedError(`the drain ${detail}`);
      }
      return headSha === baseSha ? reviewFixesSha : headSha;
    },
    () => {
      rmSync(verdictDirectory, { force: true, recursive: true });
    },
  );
  return fixesSha;
};
