import type { Enemy } from "#src/models/enemy/Enemy";
import type { GroundPoint } from "genshin-engine";

import { computeGroundDistanceSquared } from "genshin-engine";

// The living enemies nearest a point, the nearest first, as many as the count given
export const getNearestLivingEnemies = (enemies: Iterable<Enemy>, point: GroundPoint, count: number): Enemy[] =>
  [...enemies]
    .filter(({ health }) => health > 0)
    .toSorted(
      (firstEnemy, secondEnemy) =>
        computeGroundDistanceSquared(firstEnemy.position, point) -
        computeGroundDistanceSquared(secondEnemy.position, point),
    )
    .slice(0, count);
