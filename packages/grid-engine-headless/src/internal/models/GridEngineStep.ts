import type { Direction } from "#src/models/Direction";
import type { Position } from "#src/models/Position";

// A character on its way to a neighbouring tile. Progress runs from zero to the step's length, and the tile is reached
// When it is full
export interface GridEngineStep {
  direction: Direction;
  enterTile: Position;
  exitTile: Position;
  progress: number;
}
