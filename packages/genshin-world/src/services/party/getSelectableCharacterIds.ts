import type { Character } from "#src/models/character/Character";
import type { CharacterPackReader } from "#src/models/character/CharacterPackReader";

// The characters a team may be given: those the player holds that have a published pack, so every party member is drawn
// From its own model. A character the index lists no pack for is not offered, though it may still be held
export const getSelectableCharacterIds = (
  characters: readonly Pick<Character, "id">[],
  characterPackReaders: ReadonlyMap<number, CharacterPackReader>,
): number[] => characters.filter(({ id }) => characterPackReaders.has(id)).map(({ id }) => id);
