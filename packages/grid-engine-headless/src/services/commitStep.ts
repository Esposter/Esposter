import type { GridEngineCharacter } from "#src/models/GridEngineCharacter";
import type { GridEngineStep } from "#src/models/GridEngineStep";

// The character reaches the tile its step was for, and the tile it left is released with the step
export const commitStep = (character: GridEngineCharacter, step: GridEngineStep): void => {
  character.position = step.enterTile;
  delete character.step;
};
