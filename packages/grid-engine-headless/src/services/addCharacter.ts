import type { CharacterConfig } from "#src/models/CharacterConfig";
import type { GridEngineError } from "#src/models/GridEngineError";
import type { GridEngineState } from "#src/models/GridEngineState";
import type { Result } from "neverthrow";

import { Direction } from "#src/models/Direction";
import { DEFAULT_FACING_DIRECTION, DEFAULT_SPEED } from "#src/services/constants";
import { ok } from "neverthrow";

export const addCharacter = (
  state: GridEngineState,
  {
    facingDirection = DEFAULT_FACING_DIRECTION,
    id,
    speed = DEFAULT_SPEED,
    startPosition = { x: 0, y: 0 },
  }: CharacterConfig,
): Result<void, GridEngineError> => {
  state.characters.set(id, { facingDirection, id, pendingDirection: Direction.None, position: startPosition, speed });
  return ok();
};
