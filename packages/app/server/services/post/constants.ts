// The instant scores are measured from — subtracting it keeps the age term small enough to stay comparable
// With the log-scaled vote term instead of swamping it
export const POST_RANKING_EPOCH_MS = 1_500_000_000_000;
// How much age is worth one order of magnitude of votes: a post half a day older needs ten times the likes to
// Rank alongside a newer one
export const POST_RANKING_AGE_PER_ORDER_OF_MAGNITUDE_MS = Temporal.Duration.from({ minutes: 750 }).total(
  "milliseconds",
);
