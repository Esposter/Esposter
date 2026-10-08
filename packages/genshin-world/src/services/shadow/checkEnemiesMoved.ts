import type { Enemy } from "#src/models/enemy/Enemy";

import { CASTER_REDRAW_ANGLE, CASTER_REDRAW_DISTANCE, ENEMY_POSE_LENGTH } from "#src/services/constants";

// Whether an enemy has walked or turned past the amount its shadow was last drawn at, or the enemies are not the ones
// Drawn: the poses are kept in the order the map holds them, so a camp that spawns or dies moves the count and reads as
// Moved
export const checkEnemiesMoved = (
  enemyMap: ReadonlyMap<string, Pick<Enemy, "heading" | "position">>,
  enemyPoses: readonly number[],
): boolean => {
  if (enemyPoses.length !== enemyMap.size * ENEMY_POSE_LENGTH) return true;
  let index = 0;
  for (const { heading, position } of enemyMap.values()) {
    const walked = Math.hypot(position.x - (enemyPoses[index] ?? 0), position.z - (enemyPoses[index + 1] ?? 0));
    const turned = Math.abs(heading - (enemyPoses[index + 2] ?? 0));
    if (walked > CASTER_REDRAW_DISTANCE || turned > CASTER_REDRAW_ANGLE) return true;
    index += ENEMY_POSE_LENGTH;
  }
  return false;
};
