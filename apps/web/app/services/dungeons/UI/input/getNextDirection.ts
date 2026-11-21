import type { Position } from "grid-engine-headless";

import { Direction } from "grid-engine-headless";

export const getNextDirection = (currentPosition: Position, nextPosition: Position): Direction => {
  if (nextPosition.y < currentPosition.y) return Direction.Up;
  else if (nextPosition.y > currentPosition.y) return Direction.Down;
  else if (nextPosition.x < currentPosition.x) return Direction.Left;
  else if (nextPosition.x > currentPosition.x) return Direction.Right;
  else return Direction.None;
};
