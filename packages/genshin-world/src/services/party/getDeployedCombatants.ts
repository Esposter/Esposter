import type { Combatant } from "#src/models/kit/Combatant";
import type { DeployedCombatant } from "#src/models/kit/DeployedCombatant";
import type { Party } from "#src/models/party/Party";

import { getDeployedCharacterIds } from "#src/services/party/getDeployedCharacterIds";

// The built combatant of each deployed member, in the team's order, so a passive or an action reads the team's elements,
// Regions and counts, each flagged with whether it is the character on the field. A member with no built combatant is left
// Out
export const getDeployedCombatants = (
  party: Party,
  characterIdCombatantMap: ReadonlyMap<number, Combatant>,
): DeployedCombatant[] => {
  const characterIds = getDeployedCharacterIds(party);
  const activeCharacterId = characterIds[party.activeIndex];
  return characterIds.flatMap((characterId) => {
    const combatant = characterIdCombatantMap.get(characterId);
    return combatant === undefined ? [] : [{ ...combatant, isOnField: characterId === activeCharacterId }];
  });
};
