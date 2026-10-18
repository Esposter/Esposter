import type { Enemy } from "#src/models/enemy/Enemy";
import type { GroundPoint } from "genshin-engine";

const squaredDistance = (point: GroundPoint, other: GroundPoint): number =>
  (point.x - other.x) ** 2 + (point.z - other.z) ** 2;

// The living enemies nearest a point, the nearest first, as many as the count given
export const getNearestLivingEnemies = (enemies: Iterable<Enemy>, point: GroundPoint, count: number): Enemy[] =>
  [...enemies]
    .filter(({ health }) => health > 0)
    .toSorted((a, b) => squaredDistance(a.position, point) - squaredDistance(b.position, point))
    .slice(0, count);
