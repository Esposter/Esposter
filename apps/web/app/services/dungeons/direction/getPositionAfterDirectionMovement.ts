import type { Position } from "grid-engine-headless";

import { addPositions } from "#src/services/dungeons/direction/addPositions";
import { Direction, DirectionDeltaMap } from "grid-engine-headless";

const NoOffset = { x: 0, y: 0 } as const satisfies Position;
// The core's step for a cardinal direction. Only the four cardinals have one, and only they are passed here
const getCardinalOffset = (direction: Direction): Position => DirectionDeltaMap[direction] ?? NoOffset;
// A diagonal is its two component directions travelled at once
const getDiagonalOffset = (vertical: Direction, horizontal: Direction): Position =>
  addPositions(getCardinalOffset(vertical), getCardinalOffset(horizontal));

const DirectionPositionOffsetMap = {
  [Direction.Down]: getCardinalOffset(Direction.Down),
  [Direction.DownLeft]: getDiagonalOffset(Direction.Down, Direction.Left),
  [Direction.DownRight]: getDiagonalOffset(Direction.Down, Direction.Right),
  [Direction.Left]: getCardinalOffset(Direction.Left),
  [Direction.None]: NoOffset,
  [Direction.Right]: getCardinalOffset(Direction.Right),
  [Direction.Up]: getCardinalOffset(Direction.Up),
  [Direction.UpLeft]: getDiagonalOffset(Direction.Up, Direction.Left),
  [Direction.UpRight]: getDiagonalOffset(Direction.Up, Direction.Right),
} as const satisfies Record<Direction, Position>;

export const getPositionAfterDirectionMovement = (position: Position, direction: Direction): Position =>
  addPositions(position, DirectionPositionOffsetMap[direction]);
