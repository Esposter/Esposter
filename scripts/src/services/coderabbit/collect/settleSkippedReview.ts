import type { RateLimitInput } from "#src/models/coderabbit/collect/RateLimitInput";
import type { SkippedReviewSettlement } from "#src/models/coderabbit/collect/SkippedReviewSettlement";

import { CycleOutcomeKind } from "#src/models/coderabbit/collect/CycleOutcomeKind";
import { checkIsMarked } from "#src/services/coderabbit/collect/checkIsMarked";
import { checkIsSlotFree } from "#src/services/coderabbit/collect/checkIsSlotFree";
import { postComment } from "#src/services/coderabbit/collect/postComment";
import { readCheckStatus } from "#src/services/coderabbit/collect/readCheckStatus";
import { PROBE_COMMENT } from "#src/services/coderabbit/shared/constants";

// A window the bot finished without a review is asked for it once. The bot states no deadline for a skip, so there is
// Nothing to sleep out, and its answer to the ask fires the cycle again; a window still skipped once the ask stands is
// Held, since the plan or its billing is a person's and asking again would only be skipped the same way
export const settleSkippedReview = ({
  isDryRun,
  issueComments,
  pullRequest,
  viewerLogin,
}: RateLimitInput): SkippedReviewSettlement => {
  if (issueComments.some((comment) => checkIsMarked(comment, viewerLogin, PROBE_COMMENT))) return { isHeld: true };
  // Read again, as before the push: a review a person started during the drain would be cancelled by the ask
  else if (!checkIsSlotFree(readCheckStatus(pullRequest)))
    return {
      isHeld: false,
      outcome: {
        kind: CycleOutcomeKind.Idle,
        reason: "a review started during the run, or its status could not be read — the ask is not owed",
      },
    };
  else if (isDryRun)
    return {
      isHeld: false,
      outcome: { kind: CycleOutcomeKind.Idle, reason: "would ask for the review the bot skipped" },
    };

  postComment(pullRequest, PROBE_COMMENT);
  return {
    isHeld: false,
    outcome: {
      kind: CycleOutcomeKind.Idle,
      reason: "asked once for the review the bot skipped — its answer fires the cycle again",
    },
  };
};
