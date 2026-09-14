import type { DrainStepInput } from "#src/models/coderabbit/collect/DrainStepInput";
import type { DrainStepResult } from "#src/models/coderabbit/collect/DrainStepResult";

import { CycleOutcomeKind } from "#src/models/coderabbit/collect/CycleOutcomeKind";
import { drainFindings } from "#src/services/coderabbit/collect/drainFindings";
import { getOpenBodyReviewId } from "#src/services/coderabbit/collect/getOpenBodyReviewId";
import { getOpenFindings } from "#src/services/coderabbit/collect/getOpenFindings";
import { readAnsweredCommits } from "#src/services/coderabbit/collect/readAnsweredCommits";
import { readDrainLimitResetMs } from "#src/services/coderabbit/collect/readDrainLimitResetMs";
import { getFeedbackReport } from "#src/services/coderabbit/feedback/getFeedbackReport";
import { readUnresolvedThreads } from "#src/services/coderabbit/feedback/readUnresolvedThreads";

// A limit the last run hit — Claude Code's own, read off the marker it wrote — ends the run rather than
// Downloading Claude Code to be refused again; so does a drain that could not start, since porting would put a
// Window ahead of findings that must lead it.
export const runDrainStep = async ({
  developSha,
  frontierCommits,
  isDryRun,
  issueComments,
  pullRequest,
  queueSha,
  reviewFixesSha,
  reviews,
  viewerLogin,
}: DrainStepInput): Promise<DrainStepResult> => {
  // The open set is what the bot spoke last on and no unported commit answers — a fix on the fixes branch or in
  // The queue has answered its finding already
  const newestReview = reviews.findLast(({ body }) => body);
  const unportedCommits = [
    ...(reviewFixesSha ? readAnsweredCommits(`${developSha}..${reviewFixesSha}`) : []),
    ...readAnsweredCommits(`${developSha}..${queueSha}`),
  ];
  const answeredIds = new Set(unportedCommits.flatMap(({ answers }) => answers));
  const drainedReviewIds = new Set([...unportedCommits, ...frontierCommits].flatMap(({ drains }) => drains));
  const threads = readUnresolvedThreads(pullRequest);
  const openThreads = getOpenFindings(threads, answeredIds);
  const openBodyReviewId = getOpenBodyReviewId({ drainedReviewIds, issueComments, newestReview, viewerLogin });
  console.info(
    `open findings: ${openThreads.length} inline, body-only review ${openBodyReviewId?.toString() ?? "none"}`,
  );

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
