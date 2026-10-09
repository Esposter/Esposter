import type { WindowOpenCountInput } from "#src/models/coderabbit/collect/WindowOpenCountInput";

// How many more window pull requests may open now. The rolling hour is the one budget: a window opens as soon as a slot
// Frees in it, however many are still open, since each spent its slot when it opened. A window may sit on top of one
// Already open only when the stack may carry it
export const getWindowOpenCount = ({
  isStackingAllowed,
  openCount,
  openedInLastHour,
  reviewsPerHour,
}: WindowOpenCountInput): number =>
  openCount > 0 && !isStackingAllowed ? 0 : Math.max(0, reviewsPerHour - openedInLastHour);
