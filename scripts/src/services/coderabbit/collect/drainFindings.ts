import type { DrainInput } from "#src/models/coderabbit/collect/DrainInput";
import type { GitHubEntry } from "#src/models/coderabbit/GitHubEntry";

import { checkHasMarkerComment, getMarker } from "#src/services/coderabbit/collect/checkHasMarkerComment";
import {
  DRAIN_ATTEMPT_CAP,
  DRAIN_FAILED_MARKER,
  QUARANTINED_MARKER,
  REVIEW_FIXES_BRANCH,
} from "#src/services/coderabbit/collect/constants";
import { getDrainPrompt } from "#src/services/coderabbit/collect/getDrainPrompt";
import { readCherryShas } from "#src/services/coderabbit/collect/readCherryShas";
import { readEntries } from "#src/services/coderabbit/collect/readEntries";
import { runDrain } from "#src/services/coderabbit/collect/runDrain";
import { runGh } from "#src/services/coderabbit/runGh";
import { runGit } from "#src/services/coderabbit/runGit";
import { InvalidOperationError, Operation } from "@esposter/shared";

interface DrainFindingsInput extends DrainInput {
  developSha: string;
  // The newest review's id, the unit a drain attempt is counted against
  newestReviewId: number;
  reviewFixesSha: string | undefined;
  viewerLogin: string;
}

// Claude works on the fixes branch — review-fixes while it still owes develop commits, develop's head otherwise,
// So the branch is never deleted and never stale — and the branch is pushed only after it exits cleanly, so a
// Drain that dies leaves no trace and the next run starts the same open set again. Past the attempt cap the review is quarantined: its findings stay open for a person and the caller
// Ports without them, because a pipeline stalled on one finding nobody sees costs every window after it.
// Returns the pushed review-fixes sha, or the one it started from when nothing was drained.
export const drainFindings = ({
  developSha,
  newestReviewId,
  reviewFixesSha,
  viewerLogin,
  ...drainInput
}: DrainFindingsInput): string | undefined => {
  const pullRequest = drainInput.pullRequest.toString();
  const issueComments = readEntries<GitHubEntry>(`issues/${pullRequest}/comments`);
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
  const isDrained = runDrain(getDrainPrompt(drainInput));
  if (!isDrained) {
    runGh([
      "pr",
      "comment",
      pullRequest,
      "--body",
      `${failedMarker}\nDrain attempt ${(attempts + 1).toString()} of review ${newestReviewId.toString()} failed — see the collector run.`,
    ]);
    throw new InvalidOperationError(Operation.Update, "coderabbit", "the drain step exited non-zero");
  }

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
