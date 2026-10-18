import { checkIsReputationWeeklyLimitReached } from "#src/services/reputation/checkIsReputationWeeklyLimitReached";
import { checkIsWeeklyClaimed } from "#src/services/weekly/checkIsWeeklyClaimed";

// The week's claims of one kind with one more made at the instant: those from before the week's reset dropped, and the new
// Claim added. Undefined once the week's limit of that kind is reached, the claim then refused until the reset
export const addWeeklyReputationClaim = (
  claimedAts: readonly Temporal.Instant[],
  now: Temporal.Instant,
): Temporal.Instant[] | undefined =>
  checkIsReputationWeeklyLimitReached(claimedAts, now)
    ? undefined
    : [...claimedAts.filter((claimedAt) => checkIsWeeklyClaimed(claimedAt, now)), now];
