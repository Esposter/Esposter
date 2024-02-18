import { Direction } from "grid-engine";

export const getOppositeDirection = (direction: Direction): Direction => {
  switch (direction) {
    case Direction.UP:
      return Direction.DOWN;
    case Direction.DOWN:
      return Direction.UP;
    case Direction.LEFT:
      return Direction.RIGHT;
    case Direction.RIGHT:
      return Direction.LEFT;
    case Direction.UP_LEFT:
      return Direction.DOWN_RIGHT;
    case Direction.UP_RIGHT:
      return Direction.DOWN_LEFT;
    case Direction.DOWN_LEFT:
      return Direction.UP_RIGHT;
    case Direction.DOWN_RIGHT:
      return Direction.UP_LEFT;
    default:
      return Direction.NONE;
  }
};
