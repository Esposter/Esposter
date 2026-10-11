import type { WindowOpenCountInput } from "#src/models/coderabbit/collect/WindowOpenCountInput";

// How many more window pull requests may open now: the fewer of what the rolling hour has left and what the stack has
// Left under its cap. A window may sit on top of one already open only when the stack may carry it
export const getWindowOpenCount = ({
  isStackingAllowed,
  openCount,
  openedInLastHour,
  openWindowCap,
  reviewsPerHour,
}: WindowOpenCountInput): number =>
  openCount > 0 && !isStackingAllowed
    ? 0
    : Math.max(0, Math.min(reviewsPerHour - openedInLastHour, openWindowCap - openCount));
