import type { Enemy } from "#src/models/enemy/Enemy";

import { ENEMY_FAMILY_WEAK_POINTS } from "#src/services/enemy/enemyFamilyWeakPoints";

// Whether the enemy's family has weak points the wiki states, which an aimed hit can take
export const checkHasEnemyWeakPoints = (enemy: Enemy): boolean =>
  ENEMY_FAMILY_WEAK_POINTS[enemy.enemyFamily] !== undefined;
