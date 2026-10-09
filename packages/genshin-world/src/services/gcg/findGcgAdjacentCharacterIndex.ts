import type { GcgSideState } from "#src/models/gcg/GcgSideState";

// The index of the character standing one step away from another, in the given direction and round the side's characters,
// Or nothing when no other character stands
export const findGcgAdjacentCharacterIndex = (
  side: GcgSideState,
  fromIndex: number,
  step: -1 | 1,
): number | undefined => {
  const { length } = side.characters;
  for (let offset = 1; offset < length; offset++) {
    const index = (((fromIndex + step * offset) % length) + length) % length;
    const character = side.characters.at(index);
    if (character && character.hp > 0) return index;
  }
  return undefined;
};
