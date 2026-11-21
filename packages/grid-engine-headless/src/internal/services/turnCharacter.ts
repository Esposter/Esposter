import type { GridEngineState } from "#src/internal/models/GridEngineState";
import type { Direction } from "#src/models/Direction";
import type { GridEngineError } from "#src/models/GridEngineError";
import type { Result } from "neverthrow";

import { faceCharacter } from "#src/internal/services/faceCharacter";
import { readCharacter } from "#src/internal/services/readCharacter";
import { ok } from "neverthrow";

// A turn while a step is under way is ignored: the step's direction is the facing the character keeps until it stops
export const turnCharacter = (
  state: GridEngineState,
  id: string,
  direction: Direction,
): Result<void, GridEngineError> =>
  readCharacter(state, id).andThen((character) => {
    if (character.step === undefined) faceCharacter(state, character, direction);
    return ok();
  });
