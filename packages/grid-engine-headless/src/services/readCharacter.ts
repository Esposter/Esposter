import type { GridEngineCharacter } from "#src/models/GridEngineCharacter";
import type { GridEngineError } from "#src/models/GridEngineError";
import type { GridEngineState } from "#src/models/GridEngineState";
import type { Result } from "neverthrow";

import { GridEngineErrorKind } from "#src/models/GridEngineErrorKind";
import { err, ok } from "neverthrow";

export const readCharacter = (state: GridEngineState, id: string): Result<GridEngineCharacter, GridEngineError> => {
  const character = state.characters.get(id);
  if (character === undefined) return err({ id, kind: GridEngineErrorKind.UnknownCharacter });
  return ok(character);
};
