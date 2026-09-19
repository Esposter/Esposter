import type { DrainFindingsInput } from "#src/models/coderabbit/collect/DrainFindingsInput";
import type { DrainFindingsResult } from "#src/models/coderabbit/collect/DrainFindingsResult";

import { SessionRole } from "#src/models/coderabbit/collect/SessionRole";

import { checkIsMarked } from "#src/services/coderabbit/collect/checkIsMarked";
import {
  SESSION_ATTEMPT_CAP,
  DRAIN_FAILED_MARKER,
  DRAIN_VERDICT_PREFIX,
  INSTALL_COMMAND,
  QUARANTINED_MARKER,
  REJECTIONS_FILE,
  REVIEW_FIXES_BRANCH,
  SessionRoleModelMap,
  VERDICT_FILE,
} from "#src/services/coderabbit/collect/constants";
import { getAttemptFailure } from "#src/services/coderabbit/collect/getAttemptFailure";
import { getDrainPrompt } from "#src/services/coderabbit/collect/getDrainPrompt";
import { getMarkedCount } from "#src/services/coderabbit/collect/getMarkedCount";
import { getMarker } from "#src/services/coderabbit/collect/getMarker";
import { postComment } from "#src/services/coderabbit/collect/postComment";
import { postDrainLimited } from "#src/services/coderabbit/collect/postDrainLimited";
import { postDrainVerdicts } from "#src/services/coderabbit/collect/postDrainVerdicts";
import { readDirtyPaths } from "#src/services/coderabbit/collect/readDirtyPaths";
import { readFindingSeverities } from "#src/services/coderabbit/collect/readFindingSeverities";
import { readHeadSha } from "#src/services/coderabbit/collect/readHeadSha";
import { runSession } from "#src/services/coderabbit/collect/runSession";
import { spawnPnpm } from "#src/services/coderabbit/collect/spawnPnpm";
import { runGit } from "#src/services/coderabbit/shared/runGit";
import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { InvalidOperationError, Operation, withFinalizerAsync } from "@esposter/shared";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

// Claude works on the fixes branch — ai/review-fixes while it still owes develop commits, develop's head
// Otherwise — pushed only after a clean exit, so a drain that dies leaves no trace. Past the attempt cap the
// Review is quarantined: its findings stay open for a person and the caller ports without them. Claude Code's
// Own session limit is the one non-zero exit that is not this review's failure: its deadline goes into a marker
// Comment every run reads until it lifts.
export const drainFindings = async ({
  baseSha,
  issueComments,
  newestReviewId,
  reviewFixesSha,
  viewerLogin,
  ...drainInput
}: DrainFindingsInput): Promise<DrainFindingsResult> => {
  const { pullRequest } = drainInput;
  const quarantinedMarker = getMarker(QUARANTINED_MARKER, newestReviewId);
  if (issueComments.some((comment) => checkIsMarked(comment, viewerLogin, quarantinedMarker))) {
    console.info(`review ${newestReviewId} is quarantined — porting without its fixes`);
    return { isStarted: true, reviewFixesSha };
  }

  const failedMarker = getMarker(DRAIN_FAILED_MARKER, newestReviewId);
  const attempts = getMarkedCount(issueComments, viewerLogin, failedMarker);
  if (attempts >= SESSION_ATTEMPT_CAP) {
    postComment(
      pullRequest,
      `${quarantinedMarker}\nThe drain of review ${newestReviewId} failed ${attempts} times. Its findings stay open for a person, and the collector ports without them.`,
    );
    return { isStarted: true, reviewFixesSha };
  }

  runGit(["switch", "--force-create", REVIEW_FIXES_BRANCH, baseSha]);
  // The tree the drain's own checks run against is this base, not the one the event checked out (`INSTALL_COMMAND`)
  if (spawnPnpm(INSTALL_COMMAND, { cwd: REPOSITORY_ROOT, stdio: "inherit" }).status !== 0)
    throw new InvalidOperationError(Operation.Update, "coderabbit", `the install for ${baseSha} failed`);
  // Outside the checkout, so the drain's "leave the working tree clean" and its verdicts never contend, and
  // Removed with the drain that made it — every run mints its own, and none of them is read again
  const verdictDirectory = mkdtempSync(join(tmpdir(), DRAIN_VERDICT_PREFIX));
  const result = await withFinalizerAsync(
    async () => {
      const rejectionsPath = join(verdictDirectory, REJECTIONS_FILE);
      const verdictPath = join(verdictDirectory, VERDICT_FILE);
      const commentIdSeverityMap = await readFindingSeverities(drainInput.openThreads);
      const promptInput = { ...drainInput, commentIdSeverityMap, rejectionsPath, verdictPath };
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
        postComment(
          pullRequest,
          getAttemptFailure({ attempts, marker: failedMarker, task: `drain review ${newestReviewId}` }),
        );
        throw new InvalidOperationError(
          Operation.Update,
          "coderabbit",
          isEnded
            ? `the drain left the working tree dirty:\n${dirtyPaths.join("\n")}`
            : "the drain step exited non-zero",
        );
      }

      postDrainVerdicts(promptInput);

      const headSha = readHeadSha();
      if (headSha === baseSha) {
        console.info("the drain produced no commit — every finding was rejected or already answered");
        return { isStarted: true, reviewFixesSha };
      }
      // An empty expected sha leases on the branch not existing, which is the first drain's case
      runGit([
        "push",
        `--force-with-lease=refs/heads/${REVIEW_FIXES_BRANCH}:${reviewFixesSha ?? ""}`,
        "origin",
        `${headSha}:refs/heads/${REVIEW_FIXES_BRANCH}`,
      ]);
      console.info(`pushed ${REVIEW_FIXES_BRANCH} at ${headSha}`);
      return { isStarted: true, reviewFixesSha: headSha };
    },
    () => {
      rmSync(verdictDirectory, { force: true, recursive: true });
    },
  );
  return result;
};
