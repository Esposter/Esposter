import type { EnemyCamp } from "#src/models/enemy/EnemyCamp";
import type { ReputationBountyHunt } from "#src/models/reputation/ReputationBountyHunt";

import { InvalidOperationError, Operation } from "@esposter/shared";
import { isEnemyKindId } from "#src/services/enemy/isEnemyKindId";

// The camp a taken bounty spawns: its one target standing at the hunt's spawn point, in the region the hunt names, at the
// Level the caller reads. A target kind the world does not place is an Error, since the bounty could never spawn it.
// PROVISIONAL: the region's id stands in for the camp's area, which nothing compares a camp's area against yet
export const createReputationBountyCamp = (hunt: ReputationBountyHunt, enemyLevel: number): EnemyCamp => {
  if (!isEnemyKindId(hunt.targetEnemyKindId))
    throw new InvalidOperationError(
      Operation.Read,
      String(hunt.targetEnemyKindId),
      "is an enemy kind the world does not place",
    );
  return {
    areaId: String(hunt.regionId),
    id: `reputation-bounty-${hunt.bountyId}`,
    members: [
      {
        enemyKindId: hunt.targetEnemyKindId,
        id: "0",
        level: enemyLevel,
        patrol: [],
        position: { x: hunt.spawn[0], z: hunt.spawn[2] },
      },
    ],
  };
};
