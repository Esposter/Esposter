import type { GridEngineConfig } from "#src/models/GridEngineConfig";
import type { GridEngineError } from "#src/models/GridEngineError";
import type { Result } from "neverthrow";

import { GridEngineErrorKind } from "#src/models/GridEngineErrorKind";
import { err, ok } from "neverthrow";

// A grid is one rectangle: at least one row, a first row with a tile in it, and every row as long as the first
export const checkIsGridValid = (tiles: GridEngineConfig["tiles"]): Result<void, GridEngineError> => {
  const [firstRow] = tiles;
  if (firstRow === undefined || firstRow.length === 0 || tiles.some((row) => row.length !== firstRow.length))
    return err({ kind: GridEngineErrorKind.InvalidGrid });
  return ok();
};
