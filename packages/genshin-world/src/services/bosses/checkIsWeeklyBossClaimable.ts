import { countWeeklyClaims } from "#src/services/weekly/countWeeklyClaims";

// Whether a weekly boss's Trounce Blossom can be claimed at `now`: once a week, so not while a claim of its own made
// Since the week's reset is counted. `claimedAts` are that boss's own claims, not the claims of every weekly boss
export const checkIsWeeklyBossClaimable = (
  claimedAts: readonly Temporal.ZonedDateTime[],
  now: Temporal.ZonedDateTime,
): boolean => countWeeklyClaims(claimedAts, now) === 0;
