import type { UnappliedClaimsInput } from "#src/models/coderabbit/collect/UnappliedClaimsInput";

import { checkIsMarked } from "#src/services/coderabbit/collect/checkIsMarked";
import {
  EXPRESS_FAILED_MARKER,
  EXPRESS_RELAND_STEP,
  MAIN_BRANCH,
  SESSION_ATTEMPT_CAP,
} from "#src/services/coderabbit/collect/constants";
import { parkCommits } from "#src/services/coderabbit/collect/parkCommits";
import { readCommitAttempts } from "#src/services/coderabbit/collect/readCommitAttempts";

// A claimed commit the cut could not apply waits on the unported work it needs, and the lane counts each wait against
// The attempt cap on the commit itself, once per `main` head: a pick onto the same head is the same pick, so a run
// Against an unchanged `main` is no new attempt, while every head that moves past it without letting it apply is. Past
// The cap it is parked, which takes it and its claim out of what the queue owes, so a commit that will never apply
// Stops holding the lane. Returns the commits still waiting.
export const settleUnappliedClaims = ({
  collectorSha,
  cwd,
  isDryRun,
  mainSha,
  shas,
  viewerLogin,
}: UnappliedClaimsInput): string[] => {
  const task = `cut onto ${MAIN_BRANCH} at ${mainSha}`;
  const claims = shas.map((sha) => ({
    sha,
    ...readCommitAttempts({ collectorSha, marker: EXPRESS_FAILED_MARKER, sha, viewerLogin }),
  }));
  const exhaustedShas = claims.filter(({ attempts }) => attempts >= SESSION_ATTEMPT_CAP).map(({ sha }) => sha);
  const waitingClaims = claims.filter(({ attempts }) => attempts < SESSION_ATTEMPT_CAP);
  if (!isDryRun)
    for (const { comments, recordFailure } of waitingClaims)
      if (!comments.some((comment) => checkIsMarked(comment, viewerLogin, task))) recordFailure(task);

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
