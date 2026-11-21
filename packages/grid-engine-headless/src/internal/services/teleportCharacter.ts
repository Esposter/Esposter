import type { GridEngineState } from "#src/internal/models/GridEngineState";
import type { GridEngineError } from "#src/models/GridEngineError";
import type { Position } from "#src/models/Position";
import type { Result } from "neverthrow";

import { checkIsOutsideGrid } from "#src/internal/services/checkIsOutsideGrid";
import { emitGridEvent } from "#src/internal/services/emitGridEvent";
import { endRun } from "#src/internal/services/endRun";
import { readCharacter } from "#src/internal/services/readCharacter";
import { Direction } from "#src/models/Direction";
import { GridEngineErrorKind } from "#src/models/GridEngineErrorKind";
import { err, ok } from "neverthrow";

// A teleport stops any step and any waiting move, drops the distance a step passed its end, releases the tile the step
// Left, and emits the position change as a step does. A run it was part of ends where the character lands
export const teleportCharacter = (
  state: GridEngineState,
  id: string,
  position: Position,
): Result<void, GridEngineError> =>
  readCharacter(state, id).andThen((character) => {
    if (checkIsOutsideGrid(state.tiles, position)) return err({ id, kind: GridEngineErrorKind.OutsideGrid, position });
    const exitTile = character.position;
    delete character.step;
    delete character.carry;
    character.pendingDirection = Direction.None;
    // The character and the events it raises keep their own copy of the tile, which the caller's object cannot change
    const enterTile = { x: position.x, y: position.y };
    character.position = enterTile;
    const payload = { direction: character.facingDirection, enterTile, exitTile, id };
    emitGridEvent(state, "positionChangeStarted", payload);
    emitGridEvent(state, "positionChangeFinished", payload);
    if (character.isRunning) endRun(state, character);
    return ok();
  });
