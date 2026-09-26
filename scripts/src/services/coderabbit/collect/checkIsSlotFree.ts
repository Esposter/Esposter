import type { CheckStatus } from "#src/models/coderabbit/collect/CheckStatus";

import { PENDING_BUCKET } from "#src/services/coderabbit/collect/constants";

// Whether CodeRabbit is running a review right now — the one fact both the gate and the re-read taken a moment
// Before a rate-limit ask turn on, and the reason they are not two readings of the same status with two sets of
// Rules.
//
// Fail closed: an unreadable status is not a free slot. `gh` answering nothing is indistinguishable from a review
// That started a second ago, and asking on that reading cancels it.
export const checkIsSlotFree = (checkStatus: CheckStatus | undefined): boolean =>
  checkStatus !== undefined && checkStatus.bucket !== PENDING_BUCKET;
