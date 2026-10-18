import type { Character } from "#src/models/character/Character";
import type { CharacterData } from "#src/models/character/CharacterData";

import { createCharacter } from "#src/services/character/createCharacter";

// The characters a set brought in for the first time: each held after it and not before, made as a new character in
// The order drawn, a duplicate only counting a copy
export const getNewCharacters = (
  previousCopyCountMap: ReadonlyMap<number, number>,
  nextCopyCountMap: ReadonlyMap<number, number>,
  characterDataMap: ReadonlyMap<number, CharacterData>,
): Character[] =>
  [...nextCopyCountMap.keys()]
    .filter((id) => !previousCopyCountMap.has(id))
    .map((id) => createCharacter(id, characterDataMap));
