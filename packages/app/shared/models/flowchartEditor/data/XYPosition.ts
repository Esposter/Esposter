import type { XYPosition } from "@vue-flow/core";

import { z } from "zod/v4";

export const xyPositionSchema = z.object({
  x: z.number(),
  y: z.number(),
}) satisfies z.ZodType<XYPosition>;
