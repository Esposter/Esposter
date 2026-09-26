import type { XYPosition } from "@vue-flow/core";

import { z } from "zod";

// Fractional: a drop is converted from screen to flow coordinates through the zoom, so a node rarely lands on a
// Whole unit
export const xyPositionSchema = z.object({ x: z.number(), y: z.number() }) satisfies z.ZodType<XYPosition>;
