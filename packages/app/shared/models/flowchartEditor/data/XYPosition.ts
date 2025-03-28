import type { XYPosition } from "@vue-flow/core";

import { z } from "zod";

export const xyPositionSchema = z.object({
  x: z.number(),
  y: z.number(),
}) as const satisfies z.ZodType<XYPosition>;
