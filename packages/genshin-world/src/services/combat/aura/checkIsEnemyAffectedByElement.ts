import type { Element } from "#src/models/Element";
import type { Enemy } from "#src/models/enemy/Enemy";

import { ElementAuraTypeMap } from "#src/services/combat/aura/ElementAuraTypeMap";

// Whether an enemy is under the aura the element leaves on a target, so a bonus that names the element reads it. Anemo and
// Geo leave none, so no enemy is affected by them
export const checkIsEnemyAffectedByElement = (enemy: Enemy, element: Element): boolean => {
  const auraType = ElementAuraTypeMap[element];
  return auraType !== undefined && enemy.elementalState.auras.has(auraType);
};
