import type { CharacterPackReader } from "#src/models/character/CharacterPackReader";

import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";

// The reader of a character's published pack, or the Traveler's when the index lists none for the character: a save naming
// a character outside the index draws the Traveler, since there is no stand-in to draw in its place
export const getCharacterPackReader = (
  characterPackReaders: ReadonlyMap<number, CharacterPackReader>,
  characterId: number,
): CharacterPackReader | undefined =>
  characterPackReaders.get(characterId) ?? characterPackReaders.get(TRAVELER_CHARACTER_ID);
