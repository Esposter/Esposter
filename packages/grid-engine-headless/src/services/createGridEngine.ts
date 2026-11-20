import type { GridEngine } from "#src/models/GridEngine";
import type { GridEngineConfig } from "#src/models/GridEngineConfig";
import type { GridEngineError } from "#src/models/GridEngineError";
import type { GridEngineState } from "#src/models/GridEngineState";
import type { Result } from "neverthrow";

import { addCharacter } from "#src/services/addCharacter";
import { createEngine } from "#src/services/createEngine";
import { Result as ResultFactory } from "neverthrow";

export const createGridEngine = ({ characters = [], tiles }: GridEngineConfig): Result<GridEngine, GridEngineError> => {
  const state: GridEngineState = {
    characters: new Map(),
    listeners: { directionChanged: new Set(), positionChangeFinished: new Set() },
    tiles,
  };
  return ResultFactory.combine(characters.map((character) => addCharacter(state, character))).map(() =>
    createEngine(state),
  );
};
