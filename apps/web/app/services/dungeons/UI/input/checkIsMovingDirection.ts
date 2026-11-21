import { Direction } from "grid-engine-headless";

const MOVING_DIRECTIONS = new Set<string>(Object.values(Direction).filter((direction) => direction !== Direction.None));

export const checkIsMovingDirection = (input: string): input is Exclude<Direction, typeof Direction.None> =>
  MOVING_DIRECTIONS.has(input);
