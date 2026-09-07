import { Position } from "@vue-flow/core";
import { z } from "zod";

export const positionSchema = z.enum(Position) satisfies z.ZodType<Position>;
