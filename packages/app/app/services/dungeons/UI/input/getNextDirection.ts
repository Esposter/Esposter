import type { Position } from "grid-engine";

import { Direction } from "grid-engine";

export const getNextDirection = (currentPosition: Position, nextPosition: Position): Direction => {
  if (nextPosition.y < currentPosition.y) return Direction.UP;
  else if (nextPosition.y > currentPosition.y) return Direction.DOWN;
  else if (nextPosition.x < currentPosition.x) return Direction.LEFT;
  else if (nextPosition.x > currentPosition.x) return Direction.RIGHT;
  else return Direction.NONE;
};
