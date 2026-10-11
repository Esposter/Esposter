import type { DrainStepInput } from "#src/models/coderabbit/collect/DrainStepInput";
import type { DrainStepResult } from "#src/models/coderabbit/collect/DrainStepResult";

import { drainFindings } from "#src/services/coderabbit/collect/drainFindings";
import { getOpenBodyReviewId } from "#src/services/coderabbit/collect/getOpenBodyReviewId";
import { getOpenFindings } from "#src/services/coderabbit/collect/getOpenFindings";
import { readAnsweredCommits } from "#src/services/coderabbit/collect/readAnsweredCommits";
import { readCherryShas } from "#src/services/coderabbit/collect/readCherryShas";
import { getFeedbackReport } from "#src/services/coderabbit/feedback/getFeedbackReport";
import { readUnresolvedThreads } from "#src/services/coderabbit/feedback/readUnresolvedThreads";

// A drain that could not start throws, and ends the pass the way every launch that wrote nothing does
// (`SessionUnstartedError`). A limit Claude Code hit is the cycle's to hold, before this step is reached (`runCycle`).
export const runDrainStep = async ({
  collectorSha,
  cwd,
  developCommits,
  developSha,
  isDryRun,
  issueComments,
  pullRequest,
  queueSha,
  reviewFixesSha,
  reviews,
  viewerLogin,
}: DrainStepInput): Promise<DrainStepResult> => {
  // The open set is what the bot spoke last on and no commit answers — a fix on the fixes branch, in the queue or
  // On `develop` has answered its finding already. Unported by patch id, never by range: a fixes branch a window
  // Has carried still lists every commit against develop, and so does a queue the session has not rebased.
  const newestReview = reviews.findLast(({ body }) => body);
  const owedFixShas = reviewFixesSha === undefined ? [] : readCherryShas(developSha, reviewFixesSha, cwd);
  // A fixes branch owing nothing is one a window has carried whole: the next drain starts from develop again
  const owingFixesSha = owedFixShas.length > 0 ? reviewFixesSha : undefined;
  const unportedShas = [...owedFixShas, ...readCherryShas(developSha, queueSha, cwd)];
  const unportedCommits = unportedShas.length === 0 ? [] : readAnsweredCommits(["--no-walk", ...unportedShas], cwd);
  // A fix develop carries is answered whether or not its reply landed
  const answeringCommits = [...unportedCommits, ...developCommits];
  const answeredIds = new Set(answeringCommits.flatMap(({ answers }) => answers));
  const drainedReviewIds = new Set(answeringCommits.flatMap(({ drains }) => drains));
  const threads = readUnresolvedThreads(pullRequest);
  const openThreads = getOpenFindings(threads, answeredIds, viewerLogin);
  const openBodyReviewId = getOpenBodyReviewId({ drainedReviewIds, issueComments, newestReview, viewerLogin });
  console.info(
    `open findings: ${openThreads.length} inline, body-only review ${openBodyReviewId?.toString() ?? "none"}`,
  );

  if (!newestReview || (openThreads.length === 0 && openBodyReviewId === undefined)) return { reviewFixesSha };
  else if (isDryRun) {
    console.info("would drain — a dry run runs no Claude session");
    return { reviewFixesSha };
  }

  return {
    reviewFixesSha: await drainFindings({
      baseSha: owingFixesSha ?? developSha,
      collectorSha,
      feedback: getFeedbackReport({ issueComments, isThreadListed: false, review: newestReview, threads }),
      issueComments,
      newestReviewId: newestReview.id,
      openThreads,
      pullRequest,
      reviewFixesSha,
      reviewId: openBodyReviewId,
      viewerLogin,
    }),
  };
};
