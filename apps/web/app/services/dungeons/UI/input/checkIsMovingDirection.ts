import { Direction } from "grid-engine";

export const checkIsMovingDirection = (input: string): input is Exclude<Direction, Direction.NONE> =>
  Object.values<string>(Direction)
    .filter((direction) => direction !== Direction.NONE)
    .includes(input);
