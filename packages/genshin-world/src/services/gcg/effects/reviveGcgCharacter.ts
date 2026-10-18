import type { GcgCharacterState } from "#src/models/gcg/GcgCharacterState";

// Revives a defeated character with the HP given, up to its maximum. A character still standing is left as it was
export const reviveGcgCharacter = (character: GcgCharacterState, hp: number): void => {
  if (character.hp > 0) return;
  character.hp = Math.min(character.character.hp, hp);
};
