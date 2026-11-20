import type { GridEngineCharacter } from "#src/models/GridEngineCharacter";
import type { GridEngineState } from "#src/models/GridEngineState";
import type { GridEngineStep } from "#src/models/GridEngineStep";

import { emitGridEvent } from "#src/services/emitGridEvent";

// The character reaches the tile its step was for, and the tile it left is released with the step. The position is set
// And the step cleared before the listeners hear the commit, so a listener reads the character where it now stands
export const commitStep = (state: GridEngineState, character: GridEngineCharacter, step: GridEngineStep): void => {
  character.position = step.enterTile;
  delete character.step;
  emitGridEvent(state, "positionChangeFinished", {
    direction: step.direction,
    enterTile: step.enterTile,
    exitTile: step.exitTile,
    id: character.id,
  });
};
