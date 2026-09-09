import { Direction } from "grid-engine";

const MOVING_DIRECTIONS = new Set<string>(Object.values(Direction).filter((direction) => direction !== Direction.NONE));

export const checkIsMovingDirection = (input: string): input is Exclude<Direction, Direction.NONE> =>
  MOVING_DIRECTIONS.has(input);
