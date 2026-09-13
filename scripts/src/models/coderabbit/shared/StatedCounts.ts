// The three counts a review body states about itself. They are ground truth for reconciliation: fewer findings
// In hand than these means some were missed, never that the review carried fewer.
export interface StatedCounts {
  actionable: number;
  nitpick: number;
  outsideDiff: number;
}
