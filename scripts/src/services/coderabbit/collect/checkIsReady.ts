import type { ReadinessInput } from "#src/models/coderabbit/collect/ReadinessInput";

// The readiness two-by-two of the collection cycle page (docs: infra/review-collector/collection-cycle). There is
// No size floor under the cap, because there is nothing a floor could wait for: the port already takes every
// Commit the queue owes and stops only at the cap or on a conflict, so a window that came out small is the whole
// Of what was left, and holding it back waits on a push nothing has promised while the queue stays unsynced. A
// Window over the cap is the porter's to end, not this rule's. The one non-obvious line: a held window cannot
// Grow — the commit that stopped it overflows the cap or conflicts, and both only clear once this window lands —
// So it goes out at whatever size it reached.
export const checkIsReady = ({
  fixCount,
  isForced,
  isHeld,
  pendingCommitCount,
  queueCommitCount,
}: ReadinessInput): boolean => {
  const windowCommitCount = pendingCommitCount + queueCommitCount;
  if (isForced) return fixCount > 0 || windowCommitCount > 0;
  else if (fixCount > 0) return isHeld || queueCommitCount > 0;
  return windowCommitCount > 0;
};
