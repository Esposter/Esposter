import type { Position } from "grid-engine";
import { z } from "zod";

export const positionSchema = z.object({
  x: z.number().int().nonnegative(),
  y: z.number().int().nonnegative(),
}) satisfies z.ZodType<Position>;
