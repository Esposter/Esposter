import type { GcgCharacterState } from "#src/models/gcg/GcgCharacterState";

// Heals a character for its value, up to its maximum HP, and not at all once it is defeated
export const healGcgCharacter = (character: GcgCharacterState, value: number): void => {
  if (character.hp <= 0) return;
  character.hp = Math.min(character.character.hp, character.hp + value);
};
