export interface WindowOpenCountInput {
  // Whether a window may sit on top of one already open: the stacking guard's answer, which only matters once
  // Something is open
  isStackingAllowed: boolean;
  // Window pull requests open now, which bound nothing but whether the stacking guard is asked
  openCount: number;
  // Window pull requests opened within the last hour, by their creation time: the one count the budget is spent from
  openedInLastHour: number;
  // The plan's hourly ceiling (`REVIEWS_PER_HOUR`)
  reviewsPerHour: number;
}
