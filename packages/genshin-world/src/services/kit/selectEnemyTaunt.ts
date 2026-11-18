import type { Enemy } from "#src/models/enemy/Enemy";
import type { KitEffect } from "#src/models/kit/KitEffect";
import type { KitTaunt } from "#src/models/kit/KitTaunt";

import { ENEMY_AGGRO_RANGE } from "#src/services/enemy/constants";
import { computeGroundDistance } from "genshin-engine";

// The taunt an enemy strikes instead of the character: the nearest live taunt within its aggro range, or none when no
// Live taunt is that near. A taunt is live while its seconds and its health both hold
export const selectEnemyTaunt = (enemy: Enemy, effects: readonly KitEffect[]): KitTaunt | undefined => {
  let selectedTaunt: KitTaunt | undefined;
  let selectedDistance = ENEMY_AGGRO_RANGE;
  for (const effect of effects) {
    if (effect.kind !== "taunt" || effect.secondsRemaining <= 0 || effect.health <= 0) continue;
    const distance = computeGroundDistance(effect.body.position, enemy.position);
    if (distance <= selectedDistance) {
      selectedTaunt = effect;
      selectedDistance = distance;
    }
  }
  return selectedTaunt;
};
