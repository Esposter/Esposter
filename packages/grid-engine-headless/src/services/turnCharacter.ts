import type { Direction } from "#src/models/Direction";
import type { GridEngineError } from "#src/models/GridEngineError";
import type { GridEngineState } from "#src/models/GridEngineState";
import type { Result } from "neverthrow";

import { faceCharacter } from "#src/services/faceCharacter";
import { readCharacter } from "#src/services/readCharacter";
import { ok } from "neverthrow";

export const turnCharacter = (
  state: GridEngineState,
  id: string,
  direction: Direction,
): Result<void, GridEngineError> =>
  readCharacter(state, id).andThen((character) => {
    faceCharacter(state, character, direction);
    return ok();
  });
