import type { DrainFindingsInput } from "#src/models/coderabbit/collect/DrainFindingsInput";
import type { DrainFindingsResult } from "#src/models/coderabbit/collect/DrainFindingsResult";

import { AttemptFailedError } from "#src/models/coderabbit/collect/AttemptFailedError";
import { SessionRole } from "#src/models/coderabbit/collect/SessionRole";
import { checkIsMarked } from "#src/services/coderabbit/collect/checkIsMarked";
import {
  ANSWERS_TRAILER,
  DRAIN_FAILED_MARKER,
  DRAIN_HELD_MARKER,
  DRAIN_VERDICT_PREFIX,
  DRAINS_TRAILER,
  QUEUE_BRANCH,
  REJECTIONS_FILE,
  REVIEW_FIXES_BRANCH,
  SESSION_ATTEMPT_CAP,
  SessionRoleModelMap,
  VERDICT_FILE,
} from "#src/services/coderabbit/collect/constants";
import { getAttempts } from "#src/services/coderabbit/collect/getAttempts";
import { getDrainPrompt } from "#src/services/coderabbit/collect/getDrainPrompt";
import { getMarker } from "#src/services/coderabbit/collect/getMarker";
import { getUnansweredFindings } from "#src/services/coderabbit/collect/getUnansweredFindings";
import { postComment } from "#src/services/coderabbit/collect/postComment";
import { postDrainLimited } from "#src/services/coderabbit/collect/postDrainLimited";
import { postDrainVerdicts } from "#src/services/coderabbit/collect/postDrainVerdicts";
import { readAnsweredCommits } from "#src/services/coderabbit/collect/readAnsweredCommits";
import { readDirtyPaths } from "#src/services/coderabbit/collect/readDirtyPaths";
import { readFindingSeverities } from "#src/services/coderabbit/collect/readFindingSeverities";
import { readHeadSha } from "#src/services/coderabbit/collect/readHeadSha";
import { runInstall } from "#src/services/coderabbit/collect/runInstall";
import { runSession } from "#src/services/coderabbit/collect/runSession";
import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { runGit } from "#src/services/shared/runGit";
import { InvalidOperationError, Operation, withFinalizerAsync } from "@esposter/shared";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

// Claude works on the fixes branch — ai/review-fixes while it still owes develop commits, develop's head
// Otherwise — pushed only after a clean exit, so a drain that dies leaves no trace. Past the attempt cap the
// Review is held: every run fails red and nothing ports, since a window opened over findings no drain answered
// Is a release merged with them unread. Claude Code's own limit is the one non-zero exit that is not this review's
// Failure: its deadline goes into a marker comment every run reads until it lifts.
export const drainFindings = async ({
  baseSha,
  collectorSha,
  issueComments,
  newestReviewId,
  reviewFixesSha,
  viewerLogin,
  ...drainInput
}: DrainFindingsInput): Promise<DrainFindingsResult> => {
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
    // The hold is the cap's own verdict, so it names the basis the count did: a collector that changed since drains
    // The review again. Noted once per basis, where the person the red run sends looks
    const heldMarker = getMarker(DRAIN_HELD_MARKER, newestReviewId, [collectorSha]);
    if (!issueComments.some((comment) => checkIsMarked(comment, viewerLogin, heldMarker)))
      postComment(
        pullRequest,
        `${heldMarker}\nThe drain of review ${newestReviewId} failed ${attempts} times. Nothing ports until its findings are answered — a commit on \`${QUEUE_BRANCH}\` carrying \`${ANSWERS_TRAILER}:\` or \`${DRAINS_TRAILER}:\`, a resolved thread, or a fix to the collector.`,
      );
    throw new InvalidOperationError(
      Operation.Update,
      "coderabbit",
      `the drain of review ${newestReviewId} failed ${attempts} times — nothing ports ahead of its open findings until they are answered`,
    );
  }

  runGit(["switch", "--force-create", REVIEW_FIXES_BRANCH, baseSha]);
  // The tree the drain's own checks run against is this base, not the one the event checked out (`INSTALL_COMMAND`)
  const installFailure = runInstall(REPOSITORY_ROOT);
  // Outside the checkout, so the drain's "leave the working tree clean" and its verdicts never contend, and
  // Removed with the drain that made it — every run mints its own, and none of them is read again
  const verdictDirectory = mkdtempSync(join(tmpdir(), DRAIN_VERDICT_PREFIX));
  const drainOutcome = await withFinalizerAsync(
    async () => {
      const rejectionsPath = join(verdictDirectory, REJECTIONS_FILE);
      const verdictPath = join(verdictDirectory, VERDICT_FILE);
      const commentIdSeverityMap = await readFindingSeverities(drainInput.openThreads);
      const promptInput = { ...drainInput, commentIdSeverityMap, installFailure, rejectionsPath, verdictPath };
      const prompt = getDrainPrompt(promptInput);
      const { isEnded, isStarted, limitResetAtMs } = await runSession({
        cwd: REPOSITORY_ROOT,
        model: SessionRoleModelMap[SessionRole.Drain],
        prompt,
      });
      if (!isStarted) {
        if (limitResetAtMs !== undefined) postDrainLimited(pullRequest, limitResetAtMs);
        return { isStarted: false, reviewFixesSha };
      }
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
      return { isStarted: true, reviewFixesSha: headSha === baseSha ? reviewFixesSha : headSha };
    },
    () => {
      rmSync(verdictDirectory, { force: true, recursive: true });
    },
  );
  return drainOutcome;
};
