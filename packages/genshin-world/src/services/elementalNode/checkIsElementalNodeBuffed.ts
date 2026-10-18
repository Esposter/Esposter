import type { Element } from "#src/models/Element";
import type { Enemy } from "#src/models/enemy/Enemy";

import { ElementAuraTypeMap } from "#src/services/combat/aura/ElementAuraTypeMap";
import { getAuraSourceIds } from "#src/services/combat/aura/getAuraSourceIds";
import { ELEMENTAL_NODE_SOURCE_ID } from "#src/services/elementalNode/constants";

// Whether an enemy carries a node's buff of an element: a share of its aura that a node laid, and that no reaction has
// Spent yet
export const checkIsElementalNodeBuffed = (enemy: Enemy, element: Element): boolean => {
  const auraType = ElementAuraTypeMap[element];
  return auraType !== undefined && getAuraSourceIds(enemy.elementalState, auraType).includes(ELEMENTAL_NODE_SOURCE_ID);
};
