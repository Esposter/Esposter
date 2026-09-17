import type { DrainStepInput } from "#src/models/coderabbit/collect/DrainStepInput";
import type { DrainStepResult } from "#src/models/coderabbit/collect/DrainStepResult";

import { CycleOutcomeKind } from "#src/models/coderabbit/collect/CycleOutcomeKind";
import { drainFindings } from "#src/services/coderabbit/collect/drainFindings";
import { getOpenBodyReviewId } from "#src/services/coderabbit/collect/getOpenBodyReviewId";
import { getOpenFindings } from "#src/services/coderabbit/collect/getOpenFindings";
import { readAnsweredCommits } from "#src/services/coderabbit/collect/readAnsweredCommits";
import { readCherryShas } from "#src/services/coderabbit/collect/readCherryShas";
import { readDrainLimitResetMs } from "#src/services/coderabbit/collect/readDrainLimitResetMs";
import { getFeedbackReport } from "#src/services/coderabbit/feedback/getFeedbackReport";
import { readUnresolvedThreads } from "#src/services/coderabbit/feedback/readUnresolvedThreads";

// A limit the last run hit — Claude Code's own, read off the marker it wrote — ends the run rather than
// Downloading Claude Code to be refused again; so does a drain that could not start, since porting would put a
// Window ahead of findings that must lead it.
export const runDrainStep = async ({
  cwd,
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
  // The queue has answered its finding already. Unported by patch id, never by range: a fixes branch a window has
  // Carried still lists every commit against develop, and so does a queue the session has not rebased, and a
  // Trailer read off either would keep a release from merging on a finding develop already answers.
  const newestReview = reviews.findLast(({ body }) => body);
  const owedFixShas = reviewFixesSha === undefined ? [] : readCherryShas(developSha, reviewFixesSha, cwd);
  // A fixes branch owing nothing is one a window has carried whole: the next drain starts from develop again
  const owingFixesSha = owedFixShas.length > 0 ? reviewFixesSha : undefined;
  const unportedShas = [...owedFixShas, ...readCherryShas(developSha, queueSha, cwd)];
  const unportedCommits = unportedShas.length === 0 ? [] : readAnsweredCommits(["--no-walk", ...unportedShas], cwd);
  // The window's own commits count too: a fix develop carries is answered whether or not its reply landed
  const answeringCommits = [...unportedCommits, ...frontierCommits];
  const answeredIds = new Set(answeringCommits.flatMap(({ answers }) => answers));
  const drainedReviewIds = new Set(answeringCommits.flatMap(({ drains }) => drains));
  const threads = readUnresolvedThreads(pullRequest);
  const openThreads = getOpenFindings(threads, answeredIds);
  const openBodyReviewId = getOpenBodyReviewId({ drainedReviewIds, issueComments, newestReview, viewerLogin });
  console.info(
    `open findings: ${openThreads.length} inline, body-only review ${openBodyReviewId?.toString() ?? "none"}`,
  );

  if (!newestReview || (openThreads.length === 0 && openBodyReviewId === undefined)) {
    // Answered by an unported commit is not answered on `develop`: the release waits for that commit to land
    const isClean = unportedCommits.every(({ answers, drains }) => answers.length === 0 && drains.length === 0);
    return { isClean, reviewFixesSha };
  } else if (isDryRun) {
    console.info("would drain — a dry run runs no Claude session");
    return { isClean: false, reviewFixesSha };
  }

  const drainLimitResetMs = readDrainLimitResetMs(issueComments, viewerLogin);
  if (drainLimitResetMs !== undefined && drainLimitResetMs > Date.now())
    return {
      isClean: false,
      outcome: {
        kind: CycleOutcomeKind.Idle,
        reason: `the drain is limited until ${new Date(drainLimitResetMs).toISOString()} — the findings stay open, so nothing ports ahead of them`,
      },
      reviewFixesSha,
    };

  const drain = await drainFindings({
    baseSha: owingFixesSha ?? developSha,
    feedback: getFeedbackReport({ issueComments, review: newestReview, threads }),
    issueComments,
    newestReviewId: newestReview.id,
    openThreads,
    pullRequest,
    reviewFixesSha,
    reviewId: openBodyReviewId,
    viewerLogin,
  });
  if (!drain.isStarted)
    return {
      isClean: false,
      outcome: { kind: CycleOutcomeKind.Idle, reason: "the drain could not start — the findings stay open" },
      reviewFixesSha,
    };
  return { isClean: false, reviewFixesSha: drain.reviewFixesSha };
};
