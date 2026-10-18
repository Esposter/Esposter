import type { Combatant } from "#src/models/kit/Combatant";
import type { DeployedCombatant } from "#src/models/kit/DeployedCombatant";
import type { Party } from "#src/models/party/Party";

import { getDeployedCharacterIds } from "#src/services/party/getDeployedCharacterIds";
import { getPartyMember } from "#src/services/party/getPartyMember";

// The built combatant of each deployed member, in the team's order, so a passive or an action reads the team's elements,
// Regions and counts, each with the Energy it holds and flagged with whether it is the character on the field. A member
// With no built combatant is left out
export const getDeployedCombatants = (
  party: Party,
  characterIdCombatantMap: ReadonlyMap<number, Combatant>,
): DeployedCombatant[] => {
  const characterIds = getDeployedCharacterIds(party);
  const activeCharacterId = characterIds[party.activeIndex];
  return characterIds.flatMap((characterId) => {
    const combatant = characterIdCombatantMap.get(characterId);
    return combatant === undefined
      ? []
      : [
          {
            ...combatant,
            energy: getPartyMember(party, characterId).energy,
            isOnField: characterId === activeCharacterId,
          },
        ];
  });
};
