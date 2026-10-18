import type { ReputationBountyClaim } from "#src/models/reputation/ReputationBountyClaim";
import type { ReputationBountyHunt } from "#src/models/reputation/ReputationBountyHunt";
import type { ReputationCity } from "#src/models/reputation/ReputationCity";

import { checkIsReputationWeeklyLimitReached } from "#src/services/reputation/checkIsReputationWeeklyLimitReached";
import { claimReputationBounty } from "#src/services/reputation/claimReputationBounty";
import { checkIsWeeklyClaimed } from "#src/services/weekly/checkIsWeeklyClaimed";

// The claim of a bounty with the week's bounty claims held: its reward, and the claims with this one added, those from before
// The week's reset dropped. Undefined where the target stands, the bounty is not the nation's, or the week's limit is reached
export const claimWeeklyReputationBounty = (
  city: ReputationCity,
  hunt: ReputationBountyHunt,
  claimedAts: readonly Temporal.Instant[],
  now: Temporal.Instant,
): ReputationBountyClaim | undefined => {
  if (checkIsReputationWeeklyLimitReached(claimedAts, now)) return undefined;
  const reward = claimReputationBounty(city, hunt);
  if (!reward) return undefined;
  return { claimedAts: [...claimedAts.filter((claimedAt) => checkIsWeeklyClaimed(claimedAt, now)), now], reward };
};
