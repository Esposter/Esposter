import type { Direction } from "#src/models/Direction";
import type { Position } from "#src/models/Position";

// A character as a reader sees it: the tile it stands on, the facing it has, and how far through its step it is. During
// A step the tile is the one the step left, so a reader draws the character between the two tiles from these three
export interface CharacterState {
  facingDirection: Direction;
  position: Position;
  progress: number;
}
