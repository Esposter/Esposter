import type { ChestLockSource } from "#src/models/chest/ChestLockSource";
import type { EnemyCamp } from "#src/models/enemy/EnemyCamp";

import { EnemyState } from "#src/models/enemy/EnemyState";
import { getSpawnKey } from "#src/services/enemy/getSpawnKey";

// Each camp as a lock on the chests within its reach, its points its members' spawns. A camp is done once every member
// Is dead or not spawned, which is how a defeated member stands until its respawn comes
export const computeCampLockSources = (
  enemyCamps: readonly EnemyCamp[],
  enemyStateMap: ReadonlyMap<string, { state: EnemyState }>,
): ChestLockSource[] =>
  enemyCamps.map(({ id, members }) => ({
    isDone: members.every(({ id: memberId }) => {
      const enemy = enemyStateMap.get(getSpawnKey(id, memberId));
      return !enemy || enemy.state === EnemyState.Dead;
    }),
    positions: members.map(({ position }) => position),
  }));
