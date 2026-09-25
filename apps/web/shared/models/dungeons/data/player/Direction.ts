import type { Direction as BaseDirection } from "grid-engine";

import { z } from "zod";

export enum Direction {
  Down = "down",
  DownLeft = "down-left",
  DownRight = "down-right",
  Left = "left",
  None = "none",
  Right = "right",
  Up = "up",
  UpLeft = "up-left",
  UpRight = "up-right",
}

export const directionSchema = z.enum(Direction) satisfies z.ZodType<BaseDirection>;
