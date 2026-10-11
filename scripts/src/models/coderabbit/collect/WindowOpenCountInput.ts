export interface WindowOpenCountInput {
  // Whether a window may sit on top of one already open: the stacking guard's answer, which only matters once
  // Something is open
  isStackingAllowed: boolean;
  // Window pull requests open now: the stack the cap is spent from, and whether the stacking guard is asked
  openCount: number;
  // Window pull requests opened within the last hour, by their creation time: the count the hourly ceiling is spent from
  openedInLastHour: number;
  // The most windows open at once (`OPEN_WINDOW_CAP`)
  openWindowCap: number;
  // The plan's hourly ceiling (`REVIEWS_PER_HOUR`)
  reviewsPerHour: number;
}
