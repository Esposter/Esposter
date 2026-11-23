import { checkIsReputationWeeklyLimitReached } from "#src/services/reputation/checkIsReputationWeeklyLimitReached";
import { recordWeeklyReputationClaim } from "#src/services/reputation/recordWeeklyReputationClaim";

// The claim a bounty makes, refused where the limit is reached: undefined once the week's claims of the kind have used
// Up The limit, the claim then refused until the reset. A request is refused at the keeper's offer instead, and records
// Its Claim with recordWeeklyReputationClaim once it pays
export const addWeeklyReputationClaim = (
  claimedAts: readonly Temporal.Instant[],
  now: Temporal.Instant,
): Temporal.Instant[] | undefined =>
  checkIsReputationWeeklyLimitReached(claimedAts, now) ? undefined : recordWeeklyReputationClaim(claimedAts, now);
