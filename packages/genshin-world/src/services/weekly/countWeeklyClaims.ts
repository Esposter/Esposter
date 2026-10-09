import { computeWeeklyResetTime } from "#src/services/weekly/computeWeeklyResetTime";

// How many claims, across every kind counted weekly together, were made since the week's reset and by `now`, a claim at
// The reset counting toward the new week
export const countWeeklyClaims = (
  claimedAts: readonly Temporal.ZonedDateTime[],
  now: Temporal.ZonedDateTime,
): number => {
  const weeklyReset = computeWeeklyResetTime(now);
  return claimedAts.filter(
    (claimedAt) =>
      Temporal.ZonedDateTime.compare(claimedAt, weeklyReset) >= 0 &&
      Temporal.ZonedDateTime.compare(claimedAt, now) <= 0,
  ).length;
};
