import type { Character } from "#src/models/character/Character";

import { CHARACTER_EXP_TO_NEXT_LEVEL } from "#src/data/character/characterExpToNext";

// A character raised by the Character EXP given it, one level for each level's EXP the EXP covers, never past the max
// Level its ascension gives. The EXP past the last level it covers is dropped, as a material's overshoot is, since a
// Character keeps no EXP toward its next level
export const raiseCharacterByExp = (character: Character, exp: number, maxLevel: number): Character => {
  let level = character.level;
  let remainingExp = exp;
  let expToNext = CHARACTER_EXP_TO_NEXT_LEVEL[level - 1];
  while (level < maxLevel && expToNext !== undefined && remainingExp >= expToNext) {
    remainingExp -= expToNext;
    level += 1;
    expToNext = CHARACTER_EXP_TO_NEXT_LEVEL[level - 1];
  }
  return level === character.level ? character : { ...character, level };
};
