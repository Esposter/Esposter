import type { Combatant } from "#src/models/kit/Combatant";
import type { KitEffect } from "#src/models/kit/KitEffect";
import type { Party } from "#src/models/party/Party";

import { getBuffedCombatant } from "#src/services/kit/effects/getBuffedCombatant";

// The final Max HP of a character after the buffs on it, which every reader of a member's Max HP takes
export const getKitMaxHealth = (
  combatant: Combatant,
  effects: readonly KitEffect[],
  party: Party,
  characterIdCombatantMap: ReadonlyMap<number, Combatant>,
): number => getBuffedCombatant(combatant, effects, party, characterIdCombatantMap).attributes.maxHealth;
