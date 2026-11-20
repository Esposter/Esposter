import type { GridEngineCharacter } from "#src/models/GridEngineCharacter";
import type { GridEngineState } from "#src/models/GridEngineState";
import type { GridEngineStep } from "#src/models/GridEngineStep";

import { Direction } from "#src/models/Direction";
import { checkIsBlocked } from "#src/services/checkIsBlocked";
import { DirectionDeltaMap } from "#src/services/DirectionDeltaMap";
import { faceCharacter } from "#src/services/faceCharacter";

// Starts the waiting move as a step. A move into a blocked tile turns the character without moving it, and a move with no
// Step starts nothing
export const startStep = (state: GridEngineState, character: GridEngineCharacter): GridEngineStep | undefined => {
  const { pendingDirection } = character;
  character.pendingDirection = Direction.None;
  const delta = DirectionDeltaMap[pendingDirection];
  if (delta === undefined) return undefined;
  const exitTile = character.position;
  const enterTile = { x: exitTile.x + delta.x, y: exitTile.y + delta.y };
  if (checkIsBlocked(state, enterTile)) {
    faceCharacter(state, character, pendingDirection);
    return undefined;
  }
  // A step turns the character silently, since the facing it leaves for is the step's own direction
  character.facingDirection = pendingDirection;
  character.step = { direction: pendingDirection, enterTile, exitTile, progress: 0 };
  return character.step;
};
