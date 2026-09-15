import type { ReadinessInput } from "#src/models/coderabbit/collect/ReadinessInput";

import { WINDOW_FILL_TARGET } from "#src/services/coderabbit/shared/constants";

// The readiness two-by-two of the collection cycle page (docs: infra/review-collector/collection-cycle). The one
// Non-obvious line: a held window cannot grow — the commit that stopped it overflows the cap or conflicts, and
// Both only clear once this window lands — so it goes out at whatever size it reached.
export const checkIsReady = ({
  fileCount,
  fixCount,
  isForced,
  isHeld,
  pendingCommitCount,
  queueCommitCount,
}: ReadinessInput): boolean => {
  const windowCommitCount = pendingCommitCount + queueCommitCount;
  if (isForced) return fixCount > 0 || windowCommitCount > 0;
  else if (fixCount > 0) return isHeld || queueCommitCount > 0;
  return windowCommitCount > 0 && (isHeld || fileCount >= WINDOW_FILL_TARGET);
};
