import type { Element } from "#src/models/Element";
import type { Combatant } from "#src/models/kit/Combatant";
import type { Party } from "#src/models/party/Party";

import { getDeployedCharacterIds } from "#src/services/party/getDeployedCharacterIds";

// The element of each deployed member that has one, in the team's order, so a passive or an action counts the team by
// Element. A member with no element adds none
export const getDeployedElements = (party: Party, characterIdCombatantMap: ReadonlyMap<number, Combatant>): Element[] =>
  getDeployedCharacterIds(party).flatMap((characterId) => {
    const element = characterIdCombatantMap.get(characterId)?.element;
    return element === undefined ? [] : [element];
  });
