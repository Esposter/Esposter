import type { ReadinessInput } from "#src/models/coderabbit/collect/ReadinessInput";

import { WINDOW_FILL_TARGET } from "#src/services/coderabbit/constants";

// The two-by-two the cycle encodes. Fixes parked and any queue commit fits: push, the fixes are what the window
// Is for. No fixes and the count reaches the target: push. No fixes and a short queue: wait, nothing is waiting
// On the slot. Fixes parked and an empty queue: park, which is the case review-fixes exists for. Force collapses
// The two waits into a push for the dispatch that judges a short window worth the slot.
export const getIsReady = ({ fileCount, fixCount, isForced, queueCommitCount }: ReadinessInput): boolean => {
  if (isForced) return fixCount > 0 || queueCommitCount > 0;
  else if (fixCount > 0) return queueCommitCount > 0;
  return queueCommitCount > 0 && fileCount >= WINDOW_FILL_TARGET;
};
