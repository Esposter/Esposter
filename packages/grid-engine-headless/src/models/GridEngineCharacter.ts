import type { Direction } from "#src/models/Direction";
import type { GridEngineStep } from "#src/models/GridEngineStep";
import type { Position } from "#src/models/Position";

// One character's state inside an engine. The pending direction is the move a call asked for, applied on the next
// Update, and Direction.None when no move waits
export interface GridEngineCharacter {
  facingDirection: Direction;
  id: string;
  pendingDirection: Direction;
  position: Position;
  speed: number;
  step?: GridEngineStep;
}
