import type { CharacterPackReader } from "#src/models/character/CharacterPackReader";

import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";

// The reader of a character's published pack, or the Traveler's when the index lists none for the character or the
// Character's model has failed to read. A save naming a character outside the index draws the Traveler, since there is no
// Stand-in to draw in its place. The Traveler's model is the last there is, so once it has failed nothing is drawn
export const getCharacterPackReader = (
  characterPackReaders: ReadonlyMap<number, CharacterPackReader>,
  characterId: number,
  unreadableCharacterIds: ReadonlySet<number>,
): CharacterPackReader | undefined => {
  const characterPackReader = characterPackReaders.get(characterId);
  if (characterPackReader !== undefined && !unreadableCharacterIds.has(characterId)) return characterPackReader;
  return unreadableCharacterIds.has(TRAVELER_CHARACTER_ID)
    ? undefined
    : characterPackReaders.get(TRAVELER_CHARACTER_ID);
};
