import { computeWeeklyResetTime } from "#src/services/bosses/computeWeeklyResetTime";

// How many claims, of any weekly boss, were made since the week's reset and by `now`, a claim at the reset counting
// Toward the new week. The first three of them in a week cost the cheap price
export const countWeeklyBossClaims = (
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
