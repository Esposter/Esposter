import type { Character } from "#src/models/character/Character";
import type { StatTables } from "#src/models/character/StatTables";
import type { Combatant } from "#src/models/kit/Combatant";
import type { Kit } from "#src/models/kit/Kit";
import type { ElementalResonance } from "#src/models/party/ElementalResonance";

import { getArtifactSetKit } from "#src/services/artifact/getArtifactSetKit";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { getCharacterAttributeLines } from "#src/services/character/getCharacterAttributeLines";

// A character's combat once its kit is built: its attributes summed under the deployed team's resonances, its kit with
// The modules of the sets it wears answering beside it, and its element and the kind of weapon it wields read off its
// Row of the roster, which the gauge a hit applies and the energy a drop gives it read
export const createCombatant = (
  character: Character,
  kit: Kit,
  elementalResonances: ElementalResonance[],
  statTables: StatTables,
): Combatant => {
  const characterData = statTables.characterDataMap.get(character.id);
  return {
    ascension: character.ascension,
    attributes: computeCharacterAttributes(getCharacterAttributeLines(character, statTables), elementalResonances),
    characterId: character.id,
    constellationCount: character.constellationCount,
    element: characterData?.element,
    elementalResonances,
    kit: getArtifactSetKit(kit, character.artifacts, statTables.artifactSetDataMap),
    level: character.level,
    weaponType: characterData?.weaponType,
  };
};
