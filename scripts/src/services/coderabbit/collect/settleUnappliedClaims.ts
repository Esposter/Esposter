import type { UnappliedClaimsInput } from "#src/models/coderabbit/collect/UnappliedClaimsInput";

import { checkIsMarked } from "#src/services/coderabbit/collect/checkIsMarked";
import {
  EXPRESS_FAILED_MARKER,
  EXPRESS_RELAND_STEP,
  MAIN_BRANCH,
  SESSION_ATTEMPT_CAP,
} from "#src/services/coderabbit/collect/constants";
import { getAttempts } from "#src/services/coderabbit/collect/getAttempts";
import { parkCommits } from "#src/services/coderabbit/collect/parkCommits";
import { postCommitComment } from "#src/services/coderabbit/collect/postCommitComment";
import { readCommitPatch } from "#src/services/coderabbit/collect/readCommitPatch";
import { readNewestCommitComments } from "#src/services/coderabbit/collect/readNewestCommitComments";

// A claimed commit the cut could not apply waits on the unported work it needs, and the lane counts each wait against
// The attempt cap on the commit itself, once per `main` head: a pick onto the same head is the same pick, so a run
// Against an unchanged `main` is no new attempt, while every head that moves past it without letting it apply is. The
// Count is keyed by the commit's patch rather than its sha, since every rewrite of the queue gives the commit a new sha
// And a count by sha started again with each: posted on whichever sha the commit has, it is read across every commit's
// Newest comments. Past the cap it is parked, which takes it and its claim out of what the queue owes, so a commit that
// Will never apply stops holding the lane. Returns the commits still waiting.
export const settleUnappliedClaims = ({
  collectorSha,
  cwd,
  isDryRun,
  mainSha,
  shas,
  viewerLogin,
}: UnappliedClaimsInput): string[] => {
  if (shas.length === 0) return [];

  const task = `cut onto ${MAIN_BRANCH} at ${mainSha}`;
  const comments = readNewestCommitComments();
  const claims = shas.map((sha) => {
    const attempts = getAttempts({
      collectorSha,
      comments,
      key: readCommitPatch(sha, cwd),
      marker: EXPRESS_FAILED_MARKER,
      post: (body) => {
        postCommitComment(sha, body);
      },
      viewerLogin,
    });
    return {
      ...attempts,
      isCountedAtHead: comments.some(
        (comment) => checkIsMarked(comment, viewerLogin, attempts.attemptMarker) && comment.body.includes(task),
      ),
      sha,
    };
  });
  const exhaustedShas = claims.filter(({ attempts }) => attempts >= SESSION_ATTEMPT_CAP).map(({ sha }) => sha);
  const waitingClaims = claims.filter(({ attempts }) => attempts < SESSION_ATTEMPT_CAP);
  if (!isDryRun)
    for (const { isCountedAtHead, recordFailure } of waitingClaims) if (!isCountedAtHead) recordFailure(task);

  if (exhaustedShas.length > 0)
    parkCommits({
      cause: `no cut onto ${MAIN_BRANCH} applied them across ${SESSION_ATTEMPT_CAP} of its heads — ${EXPRESS_RELAND_STEP}`,
      cwd,
      isDryRun,
      shas: exhaustedShas,
      viewerLogin,
    });
  return waitingClaims.map(({ sha }) => sha);
};
