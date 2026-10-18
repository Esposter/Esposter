import type { CharacterData } from "#src/models/character/CharacterData";
import type { Element } from "#src/models/Element";

import { getCharacterElement } from "#src/services/character/getCharacterElement";

// The element each deployed member is drawn in, in the team's order: a published character's from its record, and the
// Traveler's from the element he holds now, none for a member with none
export const getDeployedElements = (
  characterIds: readonly number[],
  characterDataMap: ReadonlyMap<number, Pick<CharacterData, "element">>,
  travelerElement: Element | undefined,
): (Element | undefined)[] =>
  characterIds.map((characterId) => getCharacterElement(characterId, characterDataMap, travelerElement));
