import type { GridEngineCharacter } from "#src/models/GridEngineCharacter";
import type { GridEngineState } from "#src/models/GridEngineState";
import type { GridEngineStep } from "#src/models/GridEngineStep";

import { Direction } from "#src/models/Direction";
import { checkIsBlocked } from "#src/services/checkIsBlocked";
import { DirectionDeltaMap } from "#src/services/DirectionDeltaMap";

// Starts the waiting move as a step. A move into a blocked tile, or one with no step, is dropped with nothing started
export const startStep = (state: GridEngineState, character: GridEngineCharacter): GridEngineStep | undefined => {
  const { pendingDirection } = character;
  character.pendingDirection = Direction.None;
  const delta = DirectionDeltaMap[pendingDirection];
  if (delta === undefined) return undefined;
  const enterTile = { x: character.position.x + delta.x, y: character.position.y + delta.y };
  if (checkIsBlocked(state, enterTile)) return undefined;
  character.facingDirection = pendingDirection;
  character.step = { enterTile, progress: 0 };
  return character.step;
};
