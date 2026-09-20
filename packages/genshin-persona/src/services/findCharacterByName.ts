import type { Character } from "#src/models/Character";

// Whole-name, case-insensitive: the one way a pin or a typed name is matched, by the hook and the skill alike
export const findCharacterByName = (roster: Character[], name: string): Character | undefined =>
  name ? roster.find((character) => character.name.toLowerCase() === name.toLowerCase()) : undefined;
