import type { Direction } from "#src/models/Direction";

// The distance an update left past a step's end. It waits on the character for a move in its direction, and any other
// Move, a blocked tile or a teleport drops it
export interface GridEngineCarry {
  direction: Direction;
  distance: number;
}
