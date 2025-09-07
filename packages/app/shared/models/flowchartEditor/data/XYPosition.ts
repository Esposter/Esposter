import type { XYPosition } from "@vue-flow/core";

import { z } from "zod";

export const xyPositionSchema = z.object({
  x: z.int(),
  y: z.int(),
}) satisfies z.ZodType<XYPosition>;
