import type { ReviewAskInput } from "#src/models/coderabbit/collect/ReviewAskInput";
import type { ReviewAskSettlement } from "#src/models/coderabbit/collect/ReviewAskSettlement";

import { CycleOutcomeKind } from "#src/models/coderabbit/collect/CycleOutcomeKind";
import {
  CHECK_REREAD_DELAY_SECONDS,
  REVIEW_ASK_MARKER,
  REVIEW_ASK_WAITS_MS,
} from "#src/services/coderabbit/collect/constants";
import { getMarkedAtMs } from "#src/services/coderabbit/collect/getMarkedAtMs";
import { getRetriggerDelaySeconds } from "#src/services/coderabbit/collect/getRetriggerDelaySeconds";
import { postComment } from "#src/services/coderabbit/collect/postComment";
import { PROBE_COMMENT } from "#src/services/coderabbit/shared/constants";
import { takeOne } from "@esposter/shared";

// A review the bot owes and has not run is asked for, a wait apart, up to the ask cap, and once the wait after the last
// Ask passes with the review still not run, the window is due a re-cut. Only the collector's own asks among the
// Comments it is handed count, by their marker: a person's ask spends none of them. The bot states no deadline for its
// Answer, so each wait is the collector's own, slept out by the retrigger unless the answer fires the cycle first, and an
// Ask the re-read check withholds is read again a few minutes on, since a check that moved may have sent its event to a
// Run that was ending and an unreadable one sends none. Every hold that asks settles here.
export const settleReviewAsk = ({
  checkIsAskOwed,
  isDryRun,
  issueComments,
  nowMs,
  pullRequest,
  review,
  viewerLogin,
}: ReviewAskInput): ReviewAskSettlement => {
  const askedAtMs = getMarkedAtMs(issueComments, viewerLogin, REVIEW_ASK_MARKER);
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
          reason: `asked ${askCount} of ${askCap} times for ${review} — the ${askCount < askCap ? "next ask" : "re-cut"} waits until ${new Date(waitEndsAtMs).toISOString()}`,
        },
        retriggerDelaySeconds: getRetriggerDelaySeconds(waitEndsAtMs - nowMs),
      };
    else if (askCount >= askCap) return { isRecutDue: true };
  }

  if (!checkIsAskOwed())
    return {
      isRecutDue: false,
      outcome: {
        kind: CycleOutcomeKind.Idle,
        reason: "the check moved during the run, or its status could not be read — the ask is not owed",
      },
      retriggerDelaySeconds: CHECK_REREAD_DELAY_SECONDS,
    };
  else if (isDryRun)
    return {
      isRecutDue: false,
      outcome: { kind: CycleOutcomeKind.Idle, reason: `would ask ${askCount + 1} of ${askCap} times for ${review}` },
    };

  postComment(pullRequest, `${PROBE_COMMENT}\n<!-- ${REVIEW_ASK_MARKER} -->`);
  return {
    isRecutDue: false,
    outcome: {
      kind: CycleOutcomeKind.Idle,
      reason: `asked ${askCount + 1} of ${askCap} times for ${review} — its answer fires the cycle again`,
    },
    retriggerDelaySeconds: getRetriggerDelaySeconds(takeOne(REVIEW_ASK_WAITS_MS, askCount)),
  };
};
