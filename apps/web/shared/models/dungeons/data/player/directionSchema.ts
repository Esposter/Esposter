import { Direction } from "grid-engine-headless";
import { z } from "zod";

export const directionSchema = z.enum(Direction) satisfies z.ZodType<Direction>;
