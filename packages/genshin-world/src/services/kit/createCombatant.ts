import type { Character } from "#src/models/character/Character";
import type { StatTables } from "#src/models/character/StatTables";
import type { Combatant } from "#src/models/kit/Combatant";
import type { Kit } from "#src/models/kit/Kit";
import type { AttributeLine } from "#src/models/character/AttributeLine";
import type { ElementalResonance } from "#src/models/party/ElementalResonance";

import { getArtifactSetKit } from "#src/services/artifact/getArtifactSetKit";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { getCharacterAttributeLines } from "#src/services/character/getCharacterAttributeLines";

// A character's combat once its kit is built: its attributes summed under the deployed team's resonances, its kit with
// The modules of the sets it wears answering beside it, and its element and the kind of weapon it wields read off its
// Row of the roster, which the gauge a hit applies and the energy a drop gives it read. The Traveler's is the element of
// The statue she resonated with last, which her row does not hold
export const createCombatant = (
  character: Character,
  kit: Kit,
  elementalResonances: ElementalResonance[],
  statTables: StatTables,
  element = statTables.characterDataMap.get(character.id)?.element,
  travelerBonusLines: AttributeLine[] = [],
  partyBonusLines: AttributeLine[] = [],
): Combatant => {
  const characterData = statTables.characterDataMap.get(character.id);
  return {
    ascension: character.ascension,
    attributes: computeCharacterAttributes(
      getCharacterAttributeLines(character, statTables, travelerBonusLines, partyBonusLines),
      elementalResonances,
    ),
    characterId: character.id,
    constellationCount: character.constellationCount,
    element,
    elementalResonances,
    kit: getArtifactSetKit(kit, character.artifacts, statTables.artifactSetDataMap),
    level: character.level,
    weaponType: characterData?.weaponType,
  };
};
