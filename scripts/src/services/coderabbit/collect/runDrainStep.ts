import type { DrainStepInput } from "#src/models/coderabbit/collect/DrainStepInput";
import type { DrainStepResult } from "#src/models/coderabbit/collect/DrainStepResult";

import { CycleOutcomeKind } from "#src/models/coderabbit/collect/CycleOutcomeKind";
import { drainFindings } from "#src/services/coderabbit/collect/drainFindings";
import { readDrainLimitResetMs } from "#src/services/coderabbit/collect/readDrainLimitResetMs";
import { getFeedbackReport } from "#src/services/coderabbit/feedback/getFeedbackReport";

// The drain as one step of the cycle: nothing open means nothing to do, a dry run runs no Claude session, and a
// Limit the last run hit — Claude Code's own, read off the marker that run wrote — ends the run rather than
// Downloading Claude Code to be refused again. Nothing announces that limit lifting and every queue push fires a
// Cycle, so without the marker each one would try. A drain that could not start ends the run too: the open set
// Is untouched, so porting now would put a window ahead of findings that must lead it.
export const runDrainStep = async ({
  developSha,
  isDryRun,
  issueComments,
  newestReview,
  openBodyReviewId,
  openThreads,
  pullRequest,
  reviewFixesSha,
  threads,
  viewerLogin,
}: DrainStepInput): Promise<DrainStepResult> => {
  if (!newestReview || (openThreads.length === 0 && openBodyReviewId === undefined)) return { reviewFixesSha };
  else if (isDryRun) {
    console.info("would drain — a dry run runs no Claude session");
    return { reviewFixesSha };
  }

  const drainLimitResetMs = readDrainLimitResetMs(issueComments, viewerLogin);
  if (drainLimitResetMs !== undefined && drainLimitResetMs > Date.now())
    return {
      outcome: {
        kind: CycleOutcomeKind.Idle,
        reason: `the drain is limited until ${new Date(drainLimitResetMs).toISOString()} — the findings stay open, so nothing ports ahead of them`,
      },
      reviewFixesSha,
    };

  const drain = await drainFindings({
    developSha,
    feedback: getFeedbackReport({ issueComments, review: newestReview, threads }),
    issueComments,
    newestReviewId: newestReview.id,
    openThreads,
    pullRequest,
    reviewFixesSha,
    reviewId: openBodyReviewId,
    viewerLogin,
  });
  if (drain.isLimited)
    return {
      outcome: { kind: CycleOutcomeKind.Idle, reason: "the drain could not start — the findings stay open" },
      reviewFixesSha,
    };
  return { reviewFixesSha: drain.reviewFixesSha };
};
