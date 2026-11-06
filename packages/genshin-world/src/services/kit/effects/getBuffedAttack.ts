import type { Combatant } from "#src/models/kit/Combatant";
import type { KitContext } from "#src/models/kit/KitContext";

import { getBuffedCombatant } from "#src/services/kit/effects/getBuffedCombatant";

// The combatant's ATK with the buffs on it as they stand in the context it is read in, for a hit or heal priced from it
export const getBuffedAttack = (combatant: Combatant, context: KitContext): number => {
  const { characterIdCombatantMap, kitEffectState, party } = context;
  return getBuffedCombatant(combatant, kitEffectState.effects, party, characterIdCombatantMap).attributes.attack;
};
