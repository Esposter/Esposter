import type { Enemy } from "#src/models/enemy/Enemy";

import { EnemyState } from "#src/models/enemy/EnemyState";

// Whether an enemy still stands in the world: alive, and among the enemies the world holds, so a reference a kit kept
// To it is not to one that died or whose camp left
export const checkIsEnemyStanding = (enemyMap: ReadonlyMap<string, Enemy>, enemy: Enemy): boolean => {
  if (enemy.state === EnemyState.Dead) return false;
  for (const worldEnemy of enemyMap.values()) if (worldEnemy === enemy) return true;
  return false;
};
