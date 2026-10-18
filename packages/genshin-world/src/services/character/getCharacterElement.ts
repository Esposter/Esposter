import type { CharacterData } from "#src/models/character/CharacterData";
import type { Element } from "#src/models/Element";

import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";

// The element a character is drawn in: its table's, or for the Traveler the alignment it resonated with last, which
// Is none until a statue is resonated with
export const getCharacterElement = (
  characterId: number,
  characterDataMap: ReadonlyMap<number, Pick<CharacterData, "element">>,
  travelerElement: Element | undefined,
): Element | undefined =>
  characterId === TRAVELER_CHARACTER_ID ? travelerElement : characterDataMap.get(characterId)?.element;
