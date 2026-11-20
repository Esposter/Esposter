import type { GridEngineErrorKind } from "#src/models/GridEngineErrorKind";
import type { Position } from "#src/models/Position";

// The failure a call returns, with the character or the position it was about when that is what failed
export interface GridEngineError {
  id?: string;
  kind: GridEngineErrorKind;
  position?: Position;
}
