import type { CheckStatus } from "#src/models/coderabbit/collect/CheckStatus";

import { PENDING_BUCKET } from "#src/services/coderabbit/collect/constants";

// Whether CodeRabbit is running a review right now — the one fact both the gate and the re-read taken a moment
// Before the push turn on, and the reason they are not two readings of the same status with two sets of rules.
//
// Fail closed: an unreadable status is not a free slot. `gh` answering nothing is indistinguishable from a review
// That started a second ago, and pushing on that reading cancels it for the cost of a window nobody re-measures.
export const checkIsSlotFree = (checkStatus: CheckStatus | undefined): boolean =>
  checkStatus !== undefined && checkStatus.bucket !== PENDING_BUCKET;
