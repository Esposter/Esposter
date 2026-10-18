import type { LunarReactionType } from "#src/models/combat/LunarReactionType";
import type { StellarReactionType } from "#src/models/combat/StellarReactionType";
import type { Reaction } from "#src/models/combat/Reaction";
import type { Enemy } from "#src/models/enemy/Enemy";
import type { Combatant } from "#src/models/kit/Combatant";

import { AuraType } from "#src/models/combat/AuraType";
import { Element } from "#src/models/Element";
import { applyElement } from "#src/services/combat/aura/applyElement";
import { checkIsElectroCharged } from "#src/services/combat/aura/checkIsElectroCharged";

// A combatant's element applied to an enemy at a gauge, written in place, and the reactions it triggered. An Electro or
// Hydro that lands and leaves the enemy Electro-Charged makes its combatant the one those ticks are priced from, and a
// Pyro or Dendro that lands and leaves it Burning the one Burning's are, as gcsim moves each to every application that
// Starts or feeds it, and the one that triggers Lunar-Charged the one that owns it. Its reactions are those the combatant's
// Party's Moonsign turns Lunar where it does, and the aura it leaves keeps the combatant as a source
export const applyEnemyElement = (
  enemy: Enemy,
  element: Element,
  gauge: number,
  combatant: Combatant,
  lunarReactionTypes: readonly LunarReactionType[] = [],
  stellarReactionTypes: readonly StellarReactionType[] = [],
): Reaction[] => {
  const { auras } = enemy.elementalState;
  const reactions = applyElement(enemy.elementalState, element, gauge, {
    lunarReactionTypes,
    sourceId: combatant.characterId,
    stellarReactionTypes,
  });
  if (gauge <= 0) return reactions;
  if ((element === Element.Electro || element === Element.Hydro) && checkIsElectroCharged(auras))
    enemy.electroChargedCombatant = combatant;
  else if ((element === Element.Pyro || element === Element.Dendro) && auras.has(AuraType.Burning))
    enemy.burningCombatant = combatant;
  return reactions;
};
