import type { Combatant } from "#src/models/kit/Combatant";
import type { KitEffect } from "#src/models/kit/KitEffect";
import type { Party } from "#src/models/party/Party";

import { getBuffedCombatant } from "#src/services/kit/effects/getBuffedCombatant";

// The one build of a character's combatant with the buffs on it as the team stands. A reader of several of its stats
// Takes them all from this build, as a heal reads both the member's Max HP and its Incoming Healing Bonus from it
export const getKitBuffedCombatant = (
  combatant: Combatant,
  effects: readonly KitEffect[],
  party: Party,
  characterIdCombatantMap: ReadonlyMap<number, Combatant>,
): Combatant => getBuffedCombatant(combatant, effects, party, characterIdCombatantMap);
