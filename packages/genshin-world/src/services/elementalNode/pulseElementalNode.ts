import type { Element } from "#src/models/Element";
import type { Reaction } from "#src/models/combat/Reaction";
import type { Enemy } from "#src/models/enemy/Enemy";

import { applyElement } from "#src/services/combat/aura/applyElement";
import { ElementAuraTypeMap } from "#src/services/combat/aura/ElementAuraTypeMap";
import { checkIsElementalNodeBuffed } from "#src/services/elementalNode/checkIsElementalNodeBuffed";
import {
  ELEMENTAL_NODE_BUFFED_PULSE_GAUGE,
  ELEMENTAL_NODE_MAX_GAUGE,
  ELEMENTAL_NODE_PULSE_GAUGE,
  ELEMENTAL_NODE_SOURCE_ID,
} from "#src/services/elementalNode/constants";
import { createElementalNodeStatus } from "#src/services/elementalNode/createElementalNodeStatus";
import { addEnemyStatus } from "#src/services/enemy/addEnemyStatus";

// A node's pulse on an enemy in its reach, written in place, and the reactions it triggers. An enemy cooling down from a
// Depleted buff spends the pulse on that cooldown. Otherwise the element is laid at the gauge the buff allows: the full
// Gauge on an enemy without the buff, and on one with it the buffed gauge more, up to the buff's most. applyAura keeps the
// Larger gauge over an aura the enemy holds, so the gauge laid is the aura's total, and the aura's rate is zero, so the
// Buff does not decay with time. The enemy takes the node's resistance reduction for as long as the buff lasts
export const pulseElementalNode = (enemy: Enemy, element: Element): Reaction[] => {
  if (enemy.elementalNodePulsesLeft > 0) {
    enemy.elementalNodePulsesLeft -= 1;
    return [];
  }
  const auraType = ElementAuraTypeMap[element];
  // An element that leaves no aura, Anemo and Geo, is no node's element, so a pulse of it lays nothing
  if (auraType === undefined) return [];
  const gauge = checkIsElementalNodeBuffed(enemy, element)
    ? Math.min(
        ELEMENTAL_NODE_MAX_GAUGE,
        (enemy.elementalState.auras.get(auraType)?.gauge ?? 0) + ELEMENTAL_NODE_BUFFED_PULSE_GAUGE,
      )
    : ELEMENTAL_NODE_PULSE_GAUGE;
  addEnemyStatus(enemy, createElementalNodeStatus(element));
  return applyElement(enemy.elementalState, element, gauge, {
    selfAuraSeconds: Infinity,
    sourceId: ELEMENTAL_NODE_SOURCE_ID,
  });
};
