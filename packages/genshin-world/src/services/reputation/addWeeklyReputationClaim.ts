import { checkIsReputationWeeklyLimitReached } from "#src/services/reputation/checkIsReputationWeeklyLimitReached";
import { recordWeeklyReputationClaim } from "#src/services/reputation/recordWeeklyReputationClaim";

// A bounty's claim is undefined once the week's claims of its kind have used up the limit, until the reset.
// A request is refused at the keeper's offer instead.
// It records its claim with recordWeeklyReputationClaim once it pays.
export const addWeeklyReputationClaim = (
  claimedAts: readonly Temporal.Instant[],
  now: Temporal.Instant,
): Temporal.Instant[] | undefined =>
  checkIsReputationWeeklyLimitReached(claimedAts, now) ? undefined : recordWeeklyReputationClaim(claimedAts, now);
