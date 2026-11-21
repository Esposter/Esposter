import type { GridEngineCharacter } from "#src/internal/models/GridEngineCharacter";
import type { GridEngineState } from "#src/internal/models/GridEngineState";

import { emitGridEvent } from "#src/internal/services/emitGridEvent";

// A run ends when the character stops, and the stop names the tile it stopped on
export const endRun = (state: GridEngineState, character: GridEngineCharacter): void => {
  character.isRunning = false;
  emitGridEvent(state, "movementStopped", { id: character.id, position: character.position });
};
