// Whether a claim made at `claimedAt` counts toward the week that began at `weeklyReset`, read at `now`: made at or
// After the reset and by `now`, a claim at the reset counting toward the new week
export const checkIsWeeklyClaimed = (
  claimedAt: Temporal.Instant,
  weeklyReset: Temporal.Instant,
  now: Temporal.Instant,
): boolean => Temporal.Instant.compare(claimedAt, weeklyReset) >= 0 && Temporal.Instant.compare(claimedAt, now) <= 0;
