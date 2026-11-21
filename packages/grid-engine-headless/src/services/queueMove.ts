import type { GridEngineError } from "#src/models/GridEngineError";
import type { GridEngineState } from "#src/models/GridEngineState";
import type { Result } from "neverthrow";

import { Direction } from "#src/models/Direction";
import { GridEngineErrorKind } from "#src/models/GridEngineErrorKind";
import { checkIsDiagonal } from "#src/services/checkIsDiagonal";
import { readCharacter } from "#src/services/readCharacter";
import { err, ok } from "neverthrow";

// A move waits for an update to start it, and a move a listener makes during a commit takes the distance its update has
// Left when the directions match. A move asked while the character is already moving or has one waiting is ignored
export const queueMove = (state: GridEngineState, id: string, direction: Direction): Result<void, GridEngineError> =>
  readCharacter(state, id).andThen((character) => {
    if (checkIsDiagonal(direction)) return err({ id, kind: GridEngineErrorKind.DiagonalMove });
    const isMoving = character.step !== undefined || character.pendingDirection !== Direction.None;
    if (!isMoving) character.pendingDirection = direction;
    return ok();
  });
