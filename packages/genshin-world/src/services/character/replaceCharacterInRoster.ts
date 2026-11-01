import type { Character } from "#src/models/character/Character";

// The roster keeps its order: the character a change names is written back in its own place, and the others are left as
// They are
export const replaceCharacterInRoster = (characters: readonly Character[], replacement: Character): Character[] =>
  characters.map((item) => (item.id === replacement.id ? replacement : item));
