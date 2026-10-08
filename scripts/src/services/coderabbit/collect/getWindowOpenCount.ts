import type { WindowOpenCountInput } from "#src/models/coderabbit/collect/WindowOpenCountInput";

// How many more window pull requests may open now. Each count is held under the hourly ceiling on its own, so the
// Smaller room is the answer, and a window may sit on top of one already open only when the stack may carry it
export const getWindowOpenCount = ({
  isStackingAllowed,
  openCount,
  openedInLastHour,
  reviewsPerHour,
}: WindowOpenCountInput): number => {
  if (openCount > 0 && !isStackingAllowed) return 0;
  return Math.max(0, Math.min(reviewsPerHour - openCount, reviewsPerHour - openedInLastHour));
};
