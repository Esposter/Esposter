import type { XYPosition } from "@vue-flow/core";

import { z } from "zod";

export const xyPositionSchema = z.interface({
  x: z.number(),
  y: z.number(),
}) satisfies z.ZodType<XYPosition>;
