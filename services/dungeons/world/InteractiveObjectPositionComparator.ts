import { Direction, type Position } from "grid-engine";

type ValidDirection = Direction.UP | Direction.DOWN | Direction.LEFT | Direction.RIGHT;
export type ValidDirectionMap = Record<ValidDirection, boolean>;

const InteractiveObjectPositionOffsetMap = {
  [Direction.UP]: { x: 0, y: 1 },
  [Direction.DOWN]: { x: 0, y: -1 },
  [Direction.LEFT]: { x: -1, y: 0 },
  [Direction.RIGHT]: { x: 1, y: 0 },
} as const satisfies Record<ValidDirection, Position>;

const isValidDirection = (validDirectionMap: ValidDirectionMap, direction: Direction): direction is ValidDirection =>
  direction in validDirectionMap && validDirectionMap[direction as keyof ValidDirectionMap];

export const InteractiveObjectPositionComparator = (
  playerPosition: Position,
  playerDirection: Direction,
  objectPosition: Position,
  validDirectionMap: ValidDirectionMap = {
    [Direction.UP]: true,
    [Direction.DOWN]: true,
    [Direction.LEFT]: true,
    [Direction.RIGHT]: true,
  },
): boolean => {
  if (!isValidDirection(validDirectionMap, playerDirection)) return false;
  return (
    playerPosition.x === objectPosition.x + InteractiveObjectPositionOffsetMap[playerDirection].x &&
    playerPosition.y === objectPosition.y + InteractiveObjectPositionOffsetMap[playerDirection].y
  );
};
