export interface WindowOpenCountInput {
  // Whether a window may sit on top of one already open: the stacking guard's answer, which only matters once
  // something is open
  isStackingAllowed: boolean;
  // Window pull requests open now
  openCount: number;
  // Window pull requests opened within the last hour, by their creation time
  openedInLastHour: number;
  // The plan's hourly ceiling (`REVIEWS_PER_HOUR`)
  reviewsPerHour: number;
}
