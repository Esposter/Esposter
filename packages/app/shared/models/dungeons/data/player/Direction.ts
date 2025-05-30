import { Direction } from "grid-engine";
import { z } from "zod/v4";

export const directionSchema = z.enum(Direction) satisfies z.ZodType<Direction>;
