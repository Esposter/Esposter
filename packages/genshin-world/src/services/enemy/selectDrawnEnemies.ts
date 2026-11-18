import type { Enemy } from "#src/models/enemy/Enemy";
import type { GroundPoint } from "genshin-engine";

const squaredDistance = (point: GroundPoint, other: GroundPoint): number =>
  (point.x - other.x) ** 2 + (point.z - other.z) ** 2;

// The enemies the draw takes this frame, as many as its capacity, the nearest to the character first. The map holds every
// Camp of every loaded region, so the nearest are kept in one pass, each inserted in order, rather than sorting them all.
// While no character stands in the world there is no nearest, so the map's own order decides
export const selectDrawnEnemies = (
  enemies: Iterable<Enemy>,
  target: GroundPoint | undefined,
  capacity: number,
): Enemy[] => {
  if (target === undefined) return [...enemies].slice(0, capacity);
  if (capacity === 0) return [];
  const drawn: Enemy[] = [];
  const distances: number[] = [];
  for (const enemy of enemies) {
    const distance = squaredDistance(enemy.position, target);
    if (drawn.length === capacity && distance >= distances[capacity - 1]) continue;
    // Once the draw is full, the farthest kept is the one this enemy takes the place of
    let index = Math.min(drawn.length, capacity - 1);
    for (; index > 0 && distances[index - 1] > distance; index -= 1) {
      distances[index] = distances[index - 1];
      drawn[index] = drawn[index - 1];
    }
    distances[index] = distance;
    drawn[index] = enemy;
  }
  return drawn;
};
