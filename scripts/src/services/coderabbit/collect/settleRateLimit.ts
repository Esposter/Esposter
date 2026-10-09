import type { RateLimitInput } from "#src/models/coderabbit/collect/RateLimitInput";
import type { ReviewAskSettlement } from "#src/models/coderabbit/collect/ReviewAskSettlement";

import { checkIsSlotFree } from "#src/services/coderabbit/collect/checkIsSlotFree";
import { getRateLimitBlock } from "#src/services/coderabbit/collect/getRateLimitBlock";
import { getRateLimitWaitMs } from "#src/services/coderabbit/collect/getRateLimitWaitMs";
import { getRetriggerDelaySeconds } from "#src/services/coderabbit/collect/getRetriggerDelaySeconds";
import { readCheckStatus } from "#src/services/coderabbit/collect/readCheckStatus";
import { settleReviewAsk } from "#src/services/coderabbit/collect/settleReviewAsk";

// A window the limit refused its one review is asked for it again once the deadline the bot stated has passed — the
// Runner sleeps out a stated deadline — and from then on as a skipped review is (`settleReviewAsk`), so an ask the bot
// Never answers is asked again a wait apart and ends in a re-cut rather than a hold nothing wakes. The bot answers an
// Ask by running the review or by restating the limit in its block, so only the asks since it last restated it are
// Unanswered and count. The check is read again before the ask, failing closed: a review a person started during the
// Drain would be cancelled by it.
export const settleRateLimit = ({ issueComments, nowMs, ...input }: RateLimitInput): ReviewAskSettlement => {
  const waitMs = getRateLimitWaitMs(issueComments, nowMs);
  if (waitMs) {
    const retriggerDelaySeconds = getRetriggerDelaySeconds(waitMs);
    console.info(`rate limited — retrigger in ${retriggerDelaySeconds}s, the deadline the bot stated`);
    return { isRecutDue: false, retriggerDelaySeconds };
  }

  const block = getRateLimitBlock(issueComments);
  return settleReviewAsk({
    ...input,
    checkIsAskOwed: () => checkIsSlotFree(readCheckStatus(input.pullRequest)),
    issueComments:
      block === undefined
        ? issueComments
        : issueComments.filter(({ updated_at }) => Date.parse(updated_at) > Date.parse(block.updated_at)),
    nowMs,
    review: "the review the limit refused",
  });
};
