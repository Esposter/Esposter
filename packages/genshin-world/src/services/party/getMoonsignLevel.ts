import type { Combatant } from "#src/models/kit/Combatant";
import type { Party } from "#src/models/party/Party";

import { MoonsignLevel } from "#src/models/combat/MoonsignLevel";
import { ASCENDANT_GLEAM_MOONSIGN_COUNT } from "#src/services/party/constants";
import { getDeployedCharacterIds } from "#src/services/party/getDeployedCharacterIds";

// The deployed team's Moonsign level, counting each member whose kit holds a Moonsign Benediction: Nascent Gleam for
// One, Ascendant Gleam for two or more, and none for a team with no Moonsign character
export const getMoonsignLevel = (
  characterIdCombatantMap: ReadonlyMap<number, Combatant>,
  party: Party,
): MoonsignLevel | undefined => {
  const moonsignCount = getDeployedCharacterIds(party).filter(
    (characterId) => characterIdCombatantMap.get(characterId)?.kit.moonsignBenediction !== undefined,
  ).length;
  if (moonsignCount >= ASCENDANT_GLEAM_MOONSIGN_COUNT) return MoonsignLevel.AscendantGleam;
  return moonsignCount > 0 ? MoonsignLevel.NascentGleam : undefined;
};
