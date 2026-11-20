import type { CharacterConfig } from "#src/models/CharacterConfig";
import type { GridEngineError } from "#src/models/GridEngineError";
import type { GridEngineState } from "#src/models/GridEngineState";
import type { Result } from "neverthrow";

import { Direction } from "#src/models/Direction";
import { GridEngineErrorKind } from "#src/models/GridEngineErrorKind";
import { checkIsOutsideGrid } from "#src/services/checkIsOutsideGrid";
import { DEFAULT_FACING_DIRECTION, DEFAULT_SPEED } from "#src/services/constants";
import { err, ok } from "neverthrow";

export const addCharacter = (
  state: GridEngineState,
  {
    facingDirection = DEFAULT_FACING_DIRECTION,
    id,
    speed = DEFAULT_SPEED,
    startPosition = { x: 0, y: 0 },
  }: CharacterConfig,
): Result<void, GridEngineError> => {
  if (!Number.isFinite(speed) || speed <= 0) return err({ id, kind: GridEngineErrorKind.InvalidSpeed });
  if (checkIsOutsideGrid(state.tiles, startPosition))
    return err({ id, kind: GridEngineErrorKind.OutsideGrid, position: startPosition });
  state.characters.set(id, {
    facingDirection,
    id,
    isRunning: false,
    pendingDirection: Direction.None,
    position: startPosition,
    speed,
  });
  return ok();
};
