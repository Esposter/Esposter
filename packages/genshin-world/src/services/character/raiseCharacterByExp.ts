import type { Character } from "#src/models/character/Character";

// A character raised by the Character EXP given it, one level for each level's EXP the EXP covers, never past the max
// Level its ascension gives. The EXP past the last level it covers is dropped, as a material's overshoot is, since a
// Character keeps no EXP toward its next level
export const raiseCharacterByExp = (
  character: Character,
  exp: number,
  maxLevel: number,
  expToNext: readonly number[],
): Character => {
  let level = character.level;
  let remainingExp = exp;
  let levelExp = expToNext[level - 1];
  while (level < maxLevel && levelExp !== undefined && remainingExp >= levelExp) {
    remainingExp -= levelExp;
    level += 1;
    levelExp = expToNext[level - 1];
  }
  return level === character.level ? character : { ...character, level };
};
