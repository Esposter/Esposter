import type { GridEngineCharacter } from "#src/internal/models/GridEngineCharacter";
import type { Direction } from "#src/models/Direction";

// Takes the character's carry and drops it either way: its distance returns only to a move in the carry's direction.
// Another direction, or no move at all, leaves nothing for the step that starts
export const takeCarry = (character: GridEngineCharacter, direction: Direction): number => {
  const { carry } = character;
  delete character.carry;
  return carry?.direction === direction ? carry.distance : 0;
};
