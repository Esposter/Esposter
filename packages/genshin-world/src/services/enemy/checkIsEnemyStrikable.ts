import type { Enemy } from "#src/models/enemy/Enemy";

import { EnemyState } from "#src/models/enemy/EnemyState";

// Whether a hit can land on an enemy: one that died, or is returning to its camp, takes none
export const checkIsEnemyStrikable = (enemy: Enemy): boolean =>
  enemy.state !== EnemyState.Dead && enemy.state !== EnemyState.Return;
