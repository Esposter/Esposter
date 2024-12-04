import { Direction } from "grid-engine";
import { z } from "zod";

export const directionSchema = z.nativeEnum(Direction) satisfies z.ZodType<Direction>;
