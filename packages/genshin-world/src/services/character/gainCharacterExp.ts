import type { Character } from "#src/models/character/Character";

import { raiseCharacterByExp } from "#src/services/character/raiseCharacterByExp";

// Gives `exp` Character EXP whole to each of the characters named, the Traveler and a fallen one included, each raised by
// The levels it covers up to the max level `getMaxLevel` gives it
export const gainCharacterExp = (
  characters: readonly Character[],
  characterIds: readonly number[],
  exp: number,
  getMaxLevel: (character: Character) => number,
): Character[] =>
  characters.map((character) =>
    characterIds.includes(character.id) ? raiseCharacterByExp(character, exp, getMaxLevel(character)) : character,
  );
