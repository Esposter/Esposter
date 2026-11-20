import type { Direction } from "#src/models/Direction";
import type { GridEngineStep } from "#src/models/GridEngineStep";
import type { Position } from "#src/models/Position";

// One character's state inside an engine. The pending direction is the move a call asked for, applied on the next
// Update, and Direction.None when no move waits. A run is under way from a character's first step until it stops, and
// A run that a listener's move carries on from one step to the next is still the same run
export interface GridEngineCharacter {
  facingDirection: Direction;
  id: string;
  isRunning: boolean;
  pendingDirection: Direction;
  position: Position;
  speed: number;
  step?: GridEngineStep;
}
