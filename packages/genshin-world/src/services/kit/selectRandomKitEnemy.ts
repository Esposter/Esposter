import type { Enemy } from "#src/models/enemy/Enemy";
import type { GroundPoint } from "genshin-engine";

import { EnemyState } from "#src/models/enemy/EnemyState";

// A random living enemy whose ground position lies within a radius of a point, as gcsim's RandomEnemyWithinArea picks one
// Of the enemies a circle reaches: each one within it is as likely as another, drawn from the world's seeded random
// Source, and none is picked when no living enemy lies within it
export const selectRandomKitEnemy = (
  centre: GroundPoint,
  radius: number,
  enemies: Iterable<Enemy>,
  random: () => number,
): Enemy | undefined => {
  const reachedEnemies: Enemy[] = [];
  for (const enemy of enemies)
    if (
      enemy.state !== EnemyState.Dead &&
      Math.hypot(enemy.position.x - centre.x, enemy.position.z - centre.z) <= radius
    )
      reachedEnemies.push(enemy);
  return reachedEnemies.length === 0 ? undefined : reachedEnemies[Math.floor(random() * reachedEnemies.length)];
};
