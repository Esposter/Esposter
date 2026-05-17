import type { Direction as BaseDirection } from "grid-engine";

import { z } from "zod";

export enum Direction {
  DOWN = "down",
  DOWN_LEFT = "down-left",
  DOWN_RIGHT = "down-right",
  LEFT = "left",
  NONE = "none",
  RIGHT = "right",
  UP = "up",
  UP_LEFT = "up-left",
  UP_RIGHT = "up-right",
}

export const directionSchema = z.enum(Direction) satisfies z.ZodType<BaseDirection>;
