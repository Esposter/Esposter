import type { ReadinessInput } from "#src/models/coderabbit/collect/ReadinessInput";

import { WINDOW_FILL_TARGET } from "#src/services/coderabbit/shared/constants";

// The two-by-two the cycle encodes. Fixes parked and any queue commit fits: push, the fixes are what the window
// Is for. No fixes and the count reaches the target: push. No fixes and a short queue: wait, nothing is waiting
// On the slot. Fixes parked and an empty queue: park, which is the case ai/review-fixes exists for. Force collapses
// The two waits into a push for the dispatch that judges a short window worth the slot.
//
// Waiting is only ever worth it while the window can still grow, and a held one cannot: the commit that stopped
// It overflows the cap or conflicts, and both only clear once this window lands. So a held window is as big as
// It will ever be, and holding it to the target parks it forever rather than under-filling one review — the same
// Reasoning the slot check already applies to a queue with nothing left to add. The same holds of parked fixes
// Whose very first queue commit is held: the queue is not empty, it is blocked, and the fixes landing is what
// Unblocks it — so they go out alone rather than waiting on a commit that cannot clear until they do.
export const getIsReady = ({ fileCount, fixCount, isForced, isHeld, queueCommitCount }: ReadinessInput): boolean => {
  if (isForced) return fixCount > 0 || queueCommitCount > 0;
  else if (fixCount > 0) return isHeld || queueCommitCount > 0;
  return queueCommitCount > 0 && (isHeld || fileCount >= WINDOW_FILL_TARGET);
};
