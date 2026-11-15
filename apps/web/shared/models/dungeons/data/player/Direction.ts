/* eslint-disable no-restricted-syntax -- a mirror of grid-engine's Direction, which shared code cannot import at runtime, keyed as the library keys it so a value reads the same on both sides */
import { z } from "zod";

export const Direction = {
  DOWN: "down",
  DOWN_LEFT: "down-left",
  DOWN_RIGHT: "down-right",
  LEFT: "left",
  NONE: "none",
  RIGHT: "right",
  UP: "up",
  UP_LEFT: "up-left",
  UP_RIGHT: "up-right",
} as const;
export type Direction = (typeof Direction)[keyof typeof Direction];

export const directionSchema = z.enum(Direction) satisfies z.ZodType<Direction>;
