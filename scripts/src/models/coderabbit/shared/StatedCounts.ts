// The counts a review body states about itself. They are ground truth for reconciliation: fewer findings in hand
// Than these means some were missed, never that the review carried fewer. The body buckets are keyed by the name
// The review gives them — nitpick, outside diff range, minor, duplicate — because the set is not fixed, and a
// Bucket read off a fixed list of names is one the drain never opens for.
export interface StatedCounts {
  actionable: number;
  bodyBuckets: Record<string, number>;
}
