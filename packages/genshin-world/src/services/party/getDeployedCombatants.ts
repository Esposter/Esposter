import type { Combatant } from "#src/models/kit/Combatant";
import type { Party } from "#src/models/party/Party";

import { getDeployedCharacterIds } from "#src/services/party/getDeployedCharacterIds";

// The built combatant of each deployed member, in the team's order, so a passive or an action reads the team's elements,
// Regions and counts. A member with no built combatant is left out
export const getDeployedCombatants = (
  party: Party,
  characterIdCombatantMap: ReadonlyMap<number, Combatant>,
): Combatant[] =>
  getDeployedCharacterIds(party)
    .map((characterId) => characterIdCombatantMap.get(characterId))
    .filter((combatant): combatant is Combatant => combatant !== undefined);
