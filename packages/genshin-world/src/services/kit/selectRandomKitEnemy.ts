import type { Enemy } from "#src/models/enemy/Enemy";
import type { GroundPoint } from "genshin-engine";

import { EnemyState } from "#src/models/enemy/EnemyState";
import { takeRandom } from "@esposter/shared";
import { computeGroundDistance } from "genshin-engine";

// A random living enemy whose ground position lies within a radius of a point, as gcsim's RandomEnemyWithinArea picks
// One of the enemies a circle reaches: each one within it is as likely as another, drawn from the world's seeded random
// Source, and none is picked when no living enemy lies within it
export const selectRandomKitEnemy = (
  centre: GroundPoint,
  radius: number,
  enemies: Iterable<Enemy>,
  random: () => number,
): Enemy | undefined => {
  const reachedEnemies: Enemy[] = [];
  for (const enemy of enemies)
    if (enemy.state !== EnemyState.Dead && computeGroundDistance(enemy.position, centre) <= radius)
      reachedEnemies.push(enemy);
  return reachedEnemies.length === 0 ? undefined : takeRandom(reachedEnemies, random);
};
