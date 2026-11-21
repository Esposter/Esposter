import type { GridEngineState } from "#src/internal/models/GridEngineState";
import type { GridEngine } from "#src/models/GridEngine";
import type { GridEngineConfig } from "#src/models/GridEngineConfig";
import type { GridEngineError } from "#src/models/GridEngineError";
import type { Result } from "neverthrow";

import { addCharacter } from "#src/internal/services/addCharacter";
import { checkIsGridValid } from "#src/internal/services/checkIsGridValid";
import { createEngine } from "#src/internal/services/createEngine";
import { Result as ResultFactory } from "neverthrow";

export const createGridEngine = ({ characters = [], tiles }: GridEngineConfig): Result<GridEngine, GridEngineError> =>
  checkIsGridValid(tiles).andThen(() => {
    const state: GridEngineState = {
      characters: new Map(),
      listeners: {
        directionChanged: new Set(),
        movementStarted: new Set(),
        movementStopped: new Set(),
        positionChangeFinished: new Set(),
        positionChangeStarted: new Set(),
      },
      tiles,
    };
    return ResultFactory.combine(characters.map((character) => addCharacter(state, character))).map(() =>
      createEngine(state),
    );
  });
