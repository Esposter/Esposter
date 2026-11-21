import { Direction, Directions } from "grid-engine-headless";

const MOVING_DIRECTIONS = new Set<string>(Directions.filter((direction) => direction !== Direction.None));

export const checkIsMovingDirection = (input: string): input is Exclude<Direction, typeof Direction.None> =>
  MOVING_DIRECTIONS.has(input);
