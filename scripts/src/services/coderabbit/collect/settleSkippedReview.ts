import type { ReviewAskSettlement } from "#src/models/coderabbit/collect/ReviewAskSettlement";
import type { SkippedReviewInput } from "#src/models/coderabbit/collect/SkippedReviewInput";

import { GateDecisionKind } from "#src/models/coderabbit/collect/GateDecisionKind";
import { checkIsSlotFree } from "#src/services/coderabbit/collect/checkIsSlotFree";
import { readCheckStatus } from "#src/services/coderabbit/collect/readCheckStatus";
import { settleReviewAsk } from "#src/services/coderabbit/collect/settleReviewAsk";

// A window the bot finished without a review — or whose check never came, or whose review stayed pending past the
// Time a review takes — is asked for it again (`settleReviewAsk`), and past the last ask is too big to review. Every ask
// The collector made on the window counts. The check is read again before the ask, as before the push: a review a
// Person started during the drain would be cancelled by it, and a check the gate read as pending must still be, since
// The ask is for that review and one that finished meanwhile owes none
export const settleSkippedReview = ({ gateKind, ...input }: SkippedReviewInput): ReviewAskSettlement =>
  settleReviewAsk({
    ...input,
    checkIsAskOwed: () => {
      const checkStatus = readCheckStatus(input.pullRequest);
      return checkStatus === undefined
        ? gateKind === GateDecisionKind.Missing
        : checkIsSlotFree(checkStatus) !== (gateKind === GateDecisionKind.Running);
    },
    review: "the review the bot did not run",
  });
