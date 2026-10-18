import type { StellarReactionType } from "#src/models/combat/StellarReactionType";
import type { Combatant } from "#src/models/kit/Combatant";
import type { Party } from "#src/models/party/Party";

import { getDeployedCharacterIds } from "#src/services/party/getDeployedCharacterIds";

// The Stellar reactions the deployed team's Stellar Jubilee passives enable, each once however many of them enable it
export const getPartyStellarReactionTypes = (
  characterIdCombatantMap: ReadonlyMap<number, Combatant>,
  party: Party,
): StellarReactionType[] => {
  const stellarReactionTypes = new Set<StellarReactionType>();
  for (const characterId of getDeployedCharacterIds(party))
    for (const stellarReactionType of characterIdCombatantMap.get(characterId)?.kit.stellarJubilee
      ?.stellarReactionTypes ?? [])
      stellarReactionTypes.add(stellarReactionType);
  return [...stellarReactionTypes];
};
