import type { Reaction } from "#src/models/combat/Reaction";
import type { Enemy } from "#src/models/enemy/Enemy";
import type { Combatant } from "#src/models/kit/Combatant";

import { Element } from "#src/models/Element";
import { applyElement } from "#src/services/combat/aura/applyElement";
import { checkIsElectroCharged } from "#src/services/combat/aura/checkIsElectroCharged";

// A combatant's element applied to an enemy at a gauge, written in place, and the reactions it triggered. An Electro or
// Hydro that lands and leaves the enemy Electro-Charged makes its combatant the one the ticks are priced from, as each
// Application that charges or recharges a target takes Electro-Charged over in the game
export const applyEnemyElement = (enemy: Enemy, element: Element, gauge: number, combatant: Combatant): Reaction[] => {
  const reactions = applyElement(enemy.elementalState, element, gauge);
  if (
    gauge > 0 &&
    (element === Element.Electro || element === Element.Hydro) &&
    checkIsElectroCharged(enemy.elementalState.auras)
  )
    enemy.electroChargedCombatant = combatant;
  return reactions;
};
