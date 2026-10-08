import type { GcgSideState } from "#src/models/gcg/GcgSideState";

// The index of the next character standing after one, round the side's characters, or nothing when no other stands
export const findGcgNextCharacterIndex = (side: GcgSideState, fromIndex: number): number | undefined => {
  for (let offset = 1; offset < side.characters.length; offset++) {
    const index = (fromIndex + offset) % side.characters.length;
    const character = side.characters.at(index);
    if (character && character.hp > 0) return index;
  }
  return undefined;
};
