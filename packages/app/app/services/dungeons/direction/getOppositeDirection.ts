import { exhaustiveGuard } from "@esposter/shared";
import { Direction } from "grid-engine";

export const getOppositeDirection = (direction: Direction): Direction => {
  switch (direction) {
    case Direction.DOWN:
      return Direction.UP;
    case Direction.DOWN_LEFT:
      return Direction.UP_RIGHT;
    case Direction.DOWN_RIGHT:
      return Direction.UP_LEFT;
    case Direction.LEFT:
      return Direction.RIGHT;
    case Direction.NONE:
      return Direction.NONE;
    case Direction.RIGHT:
      return Direction.LEFT;
    case Direction.UP:
      return Direction.DOWN;
    case Direction.UP_LEFT:
      return Direction.DOWN_RIGHT;
    case Direction.UP_RIGHT:
      return Direction.DOWN_LEFT;
    default:
      exhaustiveGuard(direction);
  }
};
