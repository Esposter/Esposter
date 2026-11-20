import type { Direction } from "#src/models/Direction";
import type { GridEngineCharacter } from "#src/models/GridEngineCharacter";
import type { GridEngineState } from "#src/models/GridEngineState";

import { emitGridEvent } from "#src/services/emitGridEvent";

// A character faces a direction, and hears of it only when the facing changes
export const faceCharacter = (state: GridEngineState, character: GridEngineCharacter, direction: Direction): void => {
  if (character.facingDirection === direction) return;
  character.facingDirection = direction;
  emitGridEvent(state, "directionChanged", { direction, id: character.id });
};
