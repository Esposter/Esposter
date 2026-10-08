import { computeWeeklyResetTime } from "#src/services/bosses/computeWeeklyResetTime";

// How many claims, of any weekly boss, were made since the week's reset, a claim at the reset counting toward the new
// Week. The first three of them in a week cost the cheap price
export const countWeeklyBossClaims = (
  claimedAts: readonly Temporal.ZonedDateTime[],
  now: Temporal.ZonedDateTime,
): number => {
  const weeklyReset = computeWeeklyResetTime(now);
  return claimedAts.filter((claimedAt) => Temporal.ZonedDateTime.compare(claimedAt, weeklyReset) >= 0).length;
};
