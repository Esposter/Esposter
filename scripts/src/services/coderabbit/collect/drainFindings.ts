import type { DrainFindingsInput } from "#src/models/coderabbit/collect/DrainFindingsInput";
import type { DrainFindingsResult } from "#src/models/coderabbit/collect/DrainFindingsResult";

import { checkIsMarked } from "#src/services/coderabbit/collect/checkIsMarked";
import {
  DRAIN_ATTEMPT_CAP,
  DRAIN_FAILED_MARKER,
  DRAIN_LIMITED_MARKER,
  DRAIN_VERDICT_PREFIX,
  INSTALL_COMMAND,
  QUARANTINED_MARKER,
  REJECTIONS_FILE,
  REVIEW_FIXES_BRANCH,
  VERDICT_FILE,
} from "#src/services/coderabbit/collect/constants";
import { getDrainPrompt } from "#src/services/coderabbit/collect/getDrainPrompt";
import { getMarker } from "#src/services/coderabbit/collect/getMarker";
import { postDrainVerdicts } from "#src/services/coderabbit/collect/postDrainVerdicts";
import { readCherryShas } from "#src/services/coderabbit/collect/readCherryShas";
import { runDrain } from "#src/services/coderabbit/collect/runDrain";
import { spawnPnpm } from "#src/services/coderabbit/collect/spawnPnpm";
import { runGh } from "#src/services/coderabbit/shared/runGh";
import { runGit } from "#src/services/coderabbit/shared/runGit";
import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { getNonEmptyLines } from "#src/services/shared/getNonEmptyLines";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

// Claude works on the fixes branch — ai/review-fixes while it still owes develop commits, develop's head otherwise,
// So the branch is never deleted and never stale — and the branch is pushed only after it exits cleanly, so a
// Drain that dies leaves no trace and the next run starts the same open set again. Past the attempt cap the review
// Is quarantined: its findings stay open for a person and the caller ports without them, because a pipeline
// Stalled on one finding nobody sees costs every window after it. Claude Code's own session limit is the one
// Non-zero exit that is not this review's failure, so it neither counts an attempt nor fails the run: the deadline
// Goes into a marker comment, and every run until it lifts reads that marker and skips the drain instead of
// Downloading Claude Code to be refused again.
export const drainFindings = async ({
  developSha,
  issueComments,
  newestReviewId,
  reviewFixesSha,
  viewerLogin,
  ...drainInput
}: DrainFindingsInput): Promise<DrainFindingsResult> => {
  const pullRequest = drainInput.pullRequest.toString();
  const quarantinedMarker = getMarker(QUARANTINED_MARKER, newestReviewId);
  if (issueComments.some((comment) => checkIsMarked(comment, viewerLogin, quarantinedMarker))) {
    console.info(`review ${newestReviewId} is quarantined — porting without its fixes`);
    return { isLimited: false, reviewFixesSha };
  }

  const failedMarker = getMarker(DRAIN_FAILED_MARKER, newestReviewId);
  const attempts = issueComments.filter((comment) => checkIsMarked(comment, viewerLogin, failedMarker)).length;
  if (attempts >= DRAIN_ATTEMPT_CAP) {
    runGh([
      "pr",
      "comment",
      pullRequest,
      "--body",
      `${quarantinedMarker}\nThe drain of review ${newestReviewId} failed ${attempts} times. Its findings stay open for a person, and the collector ports without them.`,
    ]);
    return { isLimited: false, reviewFixesSha };
  }

  const isOwing = reviewFixesSha !== undefined && readCherryShas(developSha, reviewFixesSha).length > 0;
  const baseSha = isOwing && reviewFixesSha ? reviewFixesSha : developSha;
  runGit(["switch", "--force-create", REVIEW_FIXES_BRANCH, baseSha]);
  // The tree the drain's own checks run against is this base, not the one the event checked out (`INSTALL_COMMAND`)
  if (spawnPnpm(INSTALL_COMMAND, { cwd: REPOSITORY_ROOT, stdio: "inherit" }).status !== 0)
    throw new InvalidOperationError(Operation.Update, "coderabbit", `the install for ${baseSha} failed`);
  // Outside the checkout, so the drain's "leave the working tree clean" and its verdicts never contend
  const verdictDirectory = mkdtempSync(join(tmpdir(), DRAIN_VERDICT_PREFIX));
  const rejectionsPath = join(verdictDirectory, REJECTIONS_FILE);
  const verdictPath = join(verdictDirectory, VERDICT_FILE);
  const { isDrained, limitResetAtMs } = await runDrain(getDrainPrompt({ ...drainInput, rejectionsPath, verdictPath }));
  if (limitResetAtMs !== undefined) {
    const resetAt = new Date(limitResetAtMs).toISOString();
    runGh([
      "pr",
      "comment",
      pullRequest,
      "--body",
      `<!-- ${DRAIN_LIMITED_MARKER} until ${resetAt} -->\nThe drain could not start — the account is out of session until ${resetAt}. No attempt is counted, and the next event after that drains the same open set.`,
    ]);
    console.info(`the drain is limited until ${resetAt} — nothing drained, nothing counted`);
    return { isLimited: true, reviewFixesSha };
  }

  // A zero exit says the session ended, never that it finished the job: a drain that stopped mid-fix leaves the
  // Rest of a finding in the working tree, and reading `HEAD` there pushes half of one as though it were whole.
  const dirtyPaths = getNonEmptyLines(runGit(["status", "--porcelain", "-uall"]));
  if (!isDrained || dirtyPaths.length > 0) {
    runGh([
      "pr",
      "comment",
      pullRequest,
      "--body",
      `${failedMarker}\nDrain attempt ${attempts + 1} of review ${newestReviewId} failed — see the collector run.`,
    ]);
    throw new InvalidOperationError(
      Operation.Update,
      "coderabbit",
      isDrained ? `the drain left the working tree dirty:\n${dirtyPaths.join("\n")}` : "the drain step exited non-zero",
    );
  }

  postDrainVerdicts({
    openThreads: drainInput.openThreads,
    pullRequest: drainInput.pullRequest,
    rejectionsPath,
    reviewId: drainInput.reviewId,
    verdictPath,
  });

  const headSha = runGit(["rev-parse", "HEAD"]).trim();
  if (headSha === baseSha) {
    console.info("the drain produced no commit — every finding was rejected or already answered");
    return { isLimited: false, reviewFixesSha };
  }

  const lease = reviewFixesSha
    ? `--force-with-lease=refs/heads/${REVIEW_FIXES_BRANCH}:${reviewFixesSha}`
    : `--force-with-lease=refs/heads/${REVIEW_FIXES_BRANCH}:`;
  runGit(["push", lease, "origin", `${headSha}:refs/heads/${REVIEW_FIXES_BRANCH}`]);
  console.info(`pushed ${REVIEW_FIXES_BRANCH} at ${headSha}`);
  return { isLimited: false, reviewFixesSha: headSha };
};
