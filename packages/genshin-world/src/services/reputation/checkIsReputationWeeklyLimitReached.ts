import { REPUTATION_WEEKLY_CLAIM_LIMIT } from "#src/services/reputation/constants";
import { countWeeklyClaims } from "#src/services/weekly/countWeeklyClaims";

// Whether the week's claims of one kind, bounties or requests, have used up its limit across every nation, counted from the
// Week's reset
export const checkIsReputationWeeklyLimitReached = (
  claimedAts: readonly Temporal.ZonedDateTime[],
  now: Temporal.ZonedDateTime,
): boolean => countWeeklyClaims(claimedAts, now) >= REPUTATION_WEEKLY_CLAIM_LIMIT;
