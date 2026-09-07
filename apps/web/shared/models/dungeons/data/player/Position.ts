import type { Position } from "grid-engine";

import { z } from "zod";

export const positionSchema = z.object({
  x: z.int().nonnegative(),
  y: z.int().nonnegative(),
}) satisfies z.ZodType<Position>;
