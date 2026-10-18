import type { Enemy } from "#src/models/enemy/Enemy";
import type { GroundPoint } from "genshin-engine";

import { EnemyState } from "#src/models/enemy/EnemyState";
import { ENEMY_CAPSULE_RADIUS } from "#src/services/enemy/constants";

// The standing enemy nearest a point within a radius of it, measured to the enemy's edge, if one stands there
export const selectNearestEnemy = (
  { x, z }: GroundPoint,
  enemies: Iterable<Enemy>,
  radius: number,
): Enemy | undefined => {
  let nearestEnemy: Enemy | undefined;
  let nearestDistance = radius + ENEMY_CAPSULE_RADIUS;
  for (const enemy of enemies) {
    if ([EnemyState.Dead, EnemyState.Return].includes(enemy.state)) continue;
    const distance = Math.hypot(enemy.position.x - x, enemy.position.z - z);
    if (distance > nearestDistance) continue;
    nearestEnemy = enemy;
    nearestDistance = distance;
  }
  return nearestEnemy;
};
