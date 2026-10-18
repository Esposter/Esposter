import type { ReputationBountyHunt } from "#src/models/reputation/ReputationBountyHunt";
import type { ReputationCity } from "#src/models/reputation/ReputationCity";

import { REPUTATION_OFFER_FIRST_LEVEL } from "#src/services/reputation/constants";

// The hunt a player takes a nation's bounty into at a level: its target is drawn from the kinds its difficulty may hunt by
// The roll, spawned at the centre of the region the bounty names, and not yet defeated. Undefined below the level bounties
// Unlock at, for a bounty the nation does not offer, or for one whose difficulty has no target or whose region the dump
// Does not place
export const takeReputationBounty = (
  city: ReputationCity,
  level: number,
  bountyId: number,
  roll: number,
): ReputationBountyHunt | undefined => {
  if (level < REPUTATION_OFFER_FIRST_LEVEL) return undefined;
  const bounty = city.bounties.find(({ id }) => id === bountyId);
  if (!bounty) return undefined;
  const enemyKindIds = city.bountyTargets.find(({ difficulty }) => difficulty === bounty.difficulty)?.enemyKindIds;
  const huntingRegion = city.huntingRegions.find(({ id }) => id === bounty.regionId);
  if (!enemyKindIds || !huntingRegion) return undefined;
  const targetEnemyKindId = enemyKindIds[Math.min(Math.floor(roll * enemyKindIds.length), enemyKindIds.length - 1)];
  if (targetEnemyKindId === undefined) return undefined;
  return {
    bountyId,
    isTargetDefeated: false,
    regionId: bounty.regionId,
    spawn: huntingRegion.center,
    targetEnemyKindId,
  };
};
