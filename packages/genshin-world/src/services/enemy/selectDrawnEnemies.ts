import type { Enemy } from "#src/models/enemy/Enemy";
import type { GroundPoint } from "genshin-engine";

import { computeGroundDistanceSquared } from "genshin-engine";

// The enemies the draw takes this frame, as many as its capacity, the nearest to the character first. The map holds
// Every Camp of every loaded region, so the nearest are kept in one pass, each inserted in order, rather than sorting
// Them all. While no character stands in the world there is no nearest, so the map's own order decides
export const selectDrawnEnemies = (
  enemies: Iterable<Enemy>,
  target: GroundPoint | undefined,
  capacity: number,
): Enemy[] => {
  if (target === undefined) return [...enemies].slice(0, capacity);
  let drawn: { distance: number; enemy: Enemy }[] = [];
  for (const enemy of enemies) {
    const distance = computeGroundDistanceSquared(enemy.position, target);
    // Once the draw is full, an enemy no nearer than its farthest kept is not drawn
    const farthest = drawn.at(-1);
    if (drawn.length === capacity && farthest !== undefined && distance >= farthest.distance) continue;
    const index = drawn.findIndex((kept) => kept.distance > distance);
    drawn = drawn.toSpliced(index === -1 ? drawn.length : index, 0, { distance, enemy });
    if (drawn.length > capacity) drawn.pop();
  }
  return drawn.map(({ enemy }) => enemy);
};
