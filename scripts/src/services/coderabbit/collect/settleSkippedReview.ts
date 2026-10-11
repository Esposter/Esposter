import type { SkippedReviewInput } from "#src/models/coderabbit/collect/SkippedReviewInput";
import type { SkippedReviewSettlement } from "#src/models/coderabbit/collect/SkippedReviewSettlement";

import { CycleOutcomeKind } from "#src/models/coderabbit/collect/CycleOutcomeKind";
import { checkIsMarked } from "#src/services/coderabbit/collect/checkIsMarked";
import { checkIsSlotFree } from "#src/services/coderabbit/collect/checkIsSlotFree";
import { REVIEW_ASK_MARKER, REVIEW_ASK_WAITS_MS } from "#src/services/coderabbit/collect/constants";
import { getRetriggerDelaySeconds } from "#src/services/coderabbit/collect/getRetriggerDelaySeconds";
import { postComment } from "#src/services/coderabbit/collect/postComment";
import { readCheckStatus } from "#src/services/coderabbit/collect/readCheckStatus";
import { PROBE_COMMENT } from "#src/services/coderabbit/shared/constants";
import { takeOne } from "@esposter/shared";

// A window the bot finished without a review is asked for it again, a wait apart, up to the ask cap, and once the wait
// After the last ask passes with the bot still skipping, the window is too big to review and is due a re-cut. Only the
// Collector's own asks count, by their marker: a person's ask, or the rate limit's, spends none of them. The bot states
// No deadline for a skip, so each wait is the collector's own, slept out by the retrigger unless the bot's answer to
// The ask fires the cycle first
export const settleSkippedReview = ({
  isCheckMissing,
  isDryRun,
  issueComments,
  nowMs,
  pullRequest,
  viewerLogin,
}: SkippedReviewInput): SkippedReviewSettlement => {
  const askedAtMs = issueComments
    .filter((comment) => checkIsMarked(comment, viewerLogin, REVIEW_ASK_MARKER))
    .map(({ updated_at }) => Date.parse(updated_at))
    .toSorted((first, second) => first - second);
  const askCount = askedAtMs.length;
  const askCap = REVIEW_ASK_WAITS_MS.length;
  const lastAskedAtMs = askedAtMs.at(-1);
  if (lastAskedAtMs !== undefined) {
    const waitEndsAtMs = lastAskedAtMs + takeOne(REVIEW_ASK_WAITS_MS, Math.min(askCount, askCap) - 1);
    if (nowMs < waitEndsAtMs)
      return {
        isRecutDue: false,
        outcome: {
          kind: CycleOutcomeKind.Idle,
          reason: `asked ${askCount} of ${askCap} times for the review the bot did not run — the ${askCount < askCap ? "next ask" : "re-cut"} waits until ${new Date(waitEndsAtMs).toISOString()}`,
        },
        retriggerDelaySeconds: getRetriggerDelaySeconds(waitEndsAtMs - nowMs),
      };
    else if (askCount >= askCap) return { isRecutDue: true };
  }
  // Read again, as before the push: a review a person started during the drain would be cancelled by the ask
  const checkStatus = readCheckStatus(pullRequest);
  if (!(checkStatus === undefined ? isCheckMissing : checkIsSlotFree(checkStatus)))
    return {
      isRecutDue: false,
      outcome: {
        kind: CycleOutcomeKind.Idle,
        reason: "a review started during the run, or its status could not be read — the ask is not owed",
      },
    };
  else if (isDryRun)
    return {
      isRecutDue: false,
      outcome: {
        kind: CycleOutcomeKind.Idle,
        reason: `would ask ${askCount + 1} of ${askCap} times for the review the bot did not run`,
      },
    };

  postComment(pullRequest, `${PROBE_COMMENT}\n<!-- ${REVIEW_ASK_MARKER} -->`);
  return {
    isRecutDue: false,
    outcome: {
      kind: CycleOutcomeKind.Idle,
      reason: `asked ${askCount + 1} of ${askCap} times for the review the bot did not run — its answer fires the cycle again`,
    },
    retriggerDelaySeconds: getRetriggerDelaySeconds(takeOne(REVIEW_ASK_WAITS_MS, askCount)),
  };
};
