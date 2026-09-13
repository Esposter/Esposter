import type { DrainInput } from "#src/models/coderabbit/collect/DrainInput";
import type { GitHubEntry } from "#src/models/coderabbit/GitHubEntry";

import { checkHasMarkerComment, getMarker } from "#src/services/coderabbit/collect/checkHasMarkerComment";
import {
  DRAIN_ATTEMPT_CAP,
  DRAIN_FAILED_MARKER,
  DRAIN_VERDICT_PREFIX,
  QUARANTINED_MARKER,
  REJECTIONS_FILE,
  REVIEW_FIXES_BRANCH,
  VERDICT_FILE,
} from "#src/services/coderabbit/collect/constants";
import { getDrainPrompt } from "#src/services/coderabbit/collect/getDrainPrompt";
import { postDrainVerdicts } from "#src/services/coderabbit/collect/postDrainVerdicts";
import { readCherryShas } from "#src/services/coderabbit/collect/readCherryShas";
import { runDrain } from "#src/services/coderabbit/collect/runDrain";
import { runGh } from "#src/services/coderabbit/runGh";
import { runGit } from "#src/services/coderabbit/runGit";
import { getNonEmptyLines } from "#src/services/getNonEmptyLines";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

interface DrainFindingsInput extends DrainInput {
  developSha: string;
  // The pull request's issue comments, read once by the caller — the markers live in them
  issueComments: GitHubEntry[];
  // The newest review's id, the unit a drain attempt is counted against
  newestReviewId: number;
  reviewFixesSha?: string;
  viewerLogin: string;
}

// Claude works on the fixes branch — review-fixes while it still owes develop commits, develop's head otherwise,
// So the branch is never deleted and never stale — and the branch is pushed only after it exits cleanly, so a
// Drain that dies leaves no trace and the next run starts the same open set again. Past the attempt cap the review is quarantined: its findings stay open for a person and the caller
// Ports without them, because a pipeline stalled on one finding nobody sees costs every window after it.
// Returns the pushed review-fixes sha, or the one it started from when nothing was drained.
export const drainFindings = ({
  developSha,
  issueComments,
  newestReviewId,
  reviewFixesSha,
  viewerLogin,
  ...drainInput
}: DrainFindingsInput): string | undefined => {
  const pullRequest = drainInput.pullRequest.toString();
  const quarantinedMarker = getMarker(QUARANTINED_MARKER, newestReviewId);
  if (checkHasMarkerComment(issueComments, viewerLogin, quarantinedMarker)) {
    console.info(`review ${newestReviewId.toString()} is quarantined — porting without its fixes`);
    return reviewFixesSha;
  }

  const failedMarker = getMarker(DRAIN_FAILED_MARKER, newestReviewId);
  const attempts = issueComments.filter(
    ({ body, user }) => user.login === viewerLogin && body.includes(failedMarker),
  ).length;
  if (attempts >= DRAIN_ATTEMPT_CAP) {
    runGh([
      "pr",
      "comment",
      pullRequest,
      "--body",
      `${quarantinedMarker}\nThe drain of review ${newestReviewId.toString()} failed ${attempts.toString()} times. Its findings stay open for a person, and the collector ports without them.`,
    ]);
    return reviewFixesSha;
  }

  const isOwing = reviewFixesSha !== undefined && readCherryShas(developSha, reviewFixesSha).length > 0;
  const baseSha = isOwing && reviewFixesSha ? reviewFixesSha : developSha;
  runGit(["switch", "--force-create", REVIEW_FIXES_BRANCH, baseSha]);
  // Outside the checkout, so the drain's "leave the working tree clean" and its verdicts never contend
  const verdictDirectory = mkdtempSync(join(tmpdir(), DRAIN_VERDICT_PREFIX));
  const rejectionsPath = join(verdictDirectory, REJECTIONS_FILE);
  const verdictPath = join(verdictDirectory, VERDICT_FILE);
  const isDrained = runDrain(getDrainPrompt({ ...drainInput, rejectionsPath, verdictPath }));
  // A zero exit says the session ended, never that it finished the job: a drain that stopped mid-fix leaves the
  // Rest of a finding in the working tree, and reading `HEAD` there pushes half of one as though it were whole.
  const dirtyPaths = getNonEmptyLines(runGit(["status", "--porcelain", "-uall"]));
  if (!isDrained || dirtyPaths.length > 0) {
    runGh([
      "pr",
      "comment",
      pullRequest,
      "--body",
      `${failedMarker}\nDrain attempt ${(attempts + 1).toString()} of review ${newestReviewId.toString()} failed — see the collector run.`,
    ]);
    throw new InvalidOperationError(
      Operation.Update,
      "coderabbit",
      isDrained ? `the drain left the working tree dirty:\n${dirtyPaths.join("\n")}` : "the drain step exited non-zero",
    );
  }

  postDrainVerdicts({
    pullRequest: drainInput.pullRequest,
    rejectionsPath,
    reviewId: drainInput.reviewId,
    verdictPath,
  });

  const headSha = runGit(["rev-parse", "HEAD"]).trim();
  if (headSha === baseSha) {
    console.info("the drain produced no commit — every finding was rejected or already answered");
    return reviewFixesSha;
  }

  const lease = reviewFixesSha
    ? `--force-with-lease=refs/heads/${REVIEW_FIXES_BRANCH}:${reviewFixesSha}`
    : `--force-with-lease=refs/heads/${REVIEW_FIXES_BRANCH}:`;
  runGit(["push", lease, "origin", `${headSha}:refs/heads/${REVIEW_FIXES_BRANCH}`]);
  console.info(`pushed ${REVIEW_FIXES_BRANCH} at ${headSha}`);
  return headSha;
};
