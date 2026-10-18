import type { ReputationBountyHunt } from "#src/models/reputation/ReputationBountyHunt";
import type { ReputationCity } from "#src/models/reputation/ReputationCity";
import type { ReputationReward } from "#src/models/reputation/ReputationReward";

// The reward of a bounty claimed back with the nation's keeper, which needs its target defeated. Undefined while the target
// Stands, or for a bounty the nation does not offer
export const claimReputationBounty = (
  city: ReputationCity,
  hunt: ReputationBountyHunt,
): ReputationReward | undefined =>
  hunt.isTargetDefeated ? city.bounties.find(({ id }) => id === hunt.bountyId)?.reward : undefined;
