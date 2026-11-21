import type { GridEngineCharacter } from "#src/internal/models/GridEngineCharacter";
import type { GridEngineState } from "#src/internal/models/GridEngineState";
import type { GridEngineStep } from "#src/internal/models/GridEngineStep";

import { checkIsBlocked } from "#src/internal/services/checkIsBlocked";
import { emitGridEvent } from "#src/internal/services/emitGridEvent";
import { endRun } from "#src/internal/services/endRun";
import { faceCharacter } from "#src/internal/services/faceCharacter";
import { Direction } from "#src/models/Direction";
import { DirectionDeltaMap } from "#src/services/DirectionDeltaMap";

// Starts the waiting move as a step. A move into a blocked tile turns the character without moving it, and ends the run
// It was part of; a move with no step starts nothing
export const startStep = (state: GridEngineState, character: GridEngineCharacter): GridEngineStep | undefined => {
  const { pendingDirection } = character;
  character.pendingDirection = Direction.None;
  const delta = DirectionDeltaMap[pendingDirection];
  if (delta === undefined) return undefined;
  const exitTile = character.position;
  const enterTile = { x: exitTile.x + delta.x, y: exitTile.y + delta.y };
  if (checkIsBlocked(state, enterTile)) {
    faceCharacter(state, character, pendingDirection);
    if (character.isRunning) endRun(state, character);
    return undefined;
  }
  // A step turns the character silently, since the facing it leaves for is the step's own direction
  character.facingDirection = pendingDirection;
  const step: GridEngineStep = { direction: pendingDirection, enterTile, exitTile, progress: 0 };
  character.step = step;
  if (!character.isRunning) {
    character.isRunning = true;
    emitGridEvent(state, "movementStarted", { direction: pendingDirection, id: character.id });
  }
  emitGridEvent(state, "positionChangeStarted", { direction: pendingDirection, enterTile, exitTile, id: character.id });
  return step;
};
