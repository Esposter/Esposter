import { REPUTATION_WEEKLY_CLAIM_LIMIT } from "#src/services/reputation/constants";
import { checkIsWeeklyClaimed } from "#src/services/weekly/checkIsWeeklyClaimed";

// The week's claims of one kind with one more made at the instant: those from before the week's reset dropped, the new
// Claim added, and the list kept to its newest claims of the limit's size. Past the limit a claim is still recorded, as a
// Request taken before the limit pays when it finishes. A list kept to the newest limit-many claims answers the limit's
// Count exactly, the week's claims being the newest ones
export const recordWeeklyReputationClaim = (
  claimedAts: readonly Temporal.Instant[],
  now: Temporal.Instant,
): Temporal.Instant[] =>
  [...claimedAts.filter((claimedAt) => checkIsWeeklyClaimed(claimedAt, now)), now].slice(
    -REPUTATION_WEEKLY_CLAIM_LIMIT,
  );
