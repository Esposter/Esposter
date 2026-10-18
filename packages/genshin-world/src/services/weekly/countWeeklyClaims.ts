import { computeLastWeeklyReset } from "#src/services/time/computeLastWeeklyReset";

// How many claims, across every kind counted weekly together, were made since the week's reset and by `now`, a claim at
// The reset counting toward the new week
export const countWeeklyClaims = (claimedAts: readonly Temporal.Instant[], now: Temporal.Instant): number => {
  const weeklyReset = computeLastWeeklyReset(now);
  return claimedAts.filter(
    (claimedAt) =>
      Temporal.Instant.compare(claimedAt, weeklyReset) >= 0 && Temporal.Instant.compare(claimedAt, now) <= 0,
  ).length;
};
