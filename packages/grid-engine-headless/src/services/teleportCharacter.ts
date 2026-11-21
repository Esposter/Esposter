import type { GridEngineError } from "#src/models/GridEngineError";
import type { GridEngineState } from "#src/models/GridEngineState";
import type { Position } from "#src/models/Position";
import type { Result } from "neverthrow";

import { Direction } from "#src/models/Direction";
import { GridEngineErrorKind } from "#src/models/GridEngineErrorKind";
import { checkIsOutsideGrid } from "#src/services/checkIsOutsideGrid";
import { emitGridEvent } from "#src/services/emitGridEvent";
import { endRun } from "#src/services/endRun";
import { readCharacter } from "#src/services/readCharacter";
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
    character.position = position;
    const payload = { direction: character.facingDirection, enterTile: position, exitTile, id };
    emitGridEvent(state, "positionChangeStarted", payload);
    emitGridEvent(state, "positionChangeFinished", payload);
    if (character.isRunning) endRun(state, character);
    return ok();
  });
