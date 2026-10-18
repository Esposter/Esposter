import type { ReputationCity } from "#src/models/reputation/ReputationCity";
import type { ReputationBountyHunt } from "#src/models/reputation/ReputationBountyHunt";

import { REPUTATION_OFFER_FIRST_LEVEL } from "#src/services/reputation/constants";

// The hunt a player takes a nation's bounty into at a level: its target is spawned in the region the bounty names, not yet
// Defeated. Undefined below the level bounties unlock at, or for a bounty the nation does not offer
export const takeReputationBounty = (
  city: ReputationCity,
  level: number,
  bountyId: number,
): ReputationBountyHunt | undefined => {
  if (level < REPUTATION_OFFER_FIRST_LEVEL) return undefined;
  const bounty = city.bounties.find(({ id }) => id === bountyId);
  return bounty && { bountyId, isTargetDefeated: false, regionId: bounty.regionId };
};
