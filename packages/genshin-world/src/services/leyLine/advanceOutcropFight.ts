import type { Enemy } from "#src/models/enemy/Enemy";
import type { Outcrop } from "#src/models/leyLine/Outcrop";
import type { OutcropPlacement } from "#src/models/leyLine/OutcropPlacement";

import { EnemyState } from "#src/models/enemy/EnemyState";
import { OutcropEvent } from "#src/models/leyLine/OutcropEvent";
import { advanceOutcrop } from "#src/services/leyLine/advanceOutcrop";
import { computeOutcropCampId } from "#src/services/leyLine/computeOutcropCampId";

// The outcrop after an enemy is defeated: once every enemy of its place's camp is down, the fight is won and the blossom
// Reveals. Enemies of other camps are not its fight, and a camp with one still standing, or none in view, changes nothing
export const advanceOutcropFight = (
  placements: OutcropPlacement[],
  outcrop: Outcrop,
  enemies: Pick<Enemy, "campId" | "state">[],
): Outcrop => {
  const campId = computeOutcropCampId(outcrop.placeId);
  const campEnemies = enemies.filter(({ campId: enemyCampId }) => enemyCampId === campId);
  if (campEnemies.length === 0 || campEnemies.some(({ state }) => state !== EnemyState.Dead)) return outcrop;
  return advanceOutcrop(placements, outcrop, undefined, OutcropEvent.LastEnemyDefeated);
};
