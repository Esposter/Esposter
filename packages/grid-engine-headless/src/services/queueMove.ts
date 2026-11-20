import type { Direction } from "#src/models/Direction";
import type { GridEngineError } from "#src/models/GridEngineError";
import type { GridEngineState } from "#src/models/GridEngineState";
import type { Result } from "neverthrow";

import { Direction as DirectionValues } from "#src/models/Direction";
import { readCharacter } from "#src/services/readCharacter";
import { ok } from "neverthrow";

// A move waits for the next update, so a move made from a listener starts on the one after the step that raised it. A
// Move asked while the character is already moving or has one waiting is ignored
export const queueMove = (state: GridEngineState, id: string, direction: Direction): Result<void, GridEngineError> =>
  readCharacter(state, id).andThen((character) => {
    const isMoving = character.step !== undefined || character.pendingDirection !== DirectionValues.None;
    if (!isMoving) character.pendingDirection = direction;
    return ok();
  });
