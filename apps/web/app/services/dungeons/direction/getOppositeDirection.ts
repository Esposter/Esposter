import { exhaustiveGuard } from "@esposter/shared";
import { Direction } from "grid-engine-headless";

export const getOppositeDirection = (direction: Direction): Direction => {
  switch (direction) {
    case Direction.Down:
      return Direction.Up;
    case Direction.DownLeft:
      return Direction.UpRight;
    case Direction.DownRight:
      return Direction.UpLeft;
    case Direction.Left:
      return Direction.Right;
    case Direction.None:
      return Direction.None;
    case Direction.Right:
      return Direction.Left;
    case Direction.Up:
      return Direction.Down;
    case Direction.UpLeft:
      return Direction.DownRight;
    case Direction.UpRight:
      return Direction.DownLeft;
    default:
      return exhaustiveGuard(direction);
  }
};
