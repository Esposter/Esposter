import type { ArrowBinding } from "#src/models/ArrowBinding";
import type { Point } from "#src/models/Point";

import { arrowBindingSchema } from "#src/models/ArrowBinding";
import { pointSchema } from "#src/models/Point";
import { z } from "zod";

// One end of an arrow: the point it sits at, its binding when it is bound to a shape, and whether it has an arrowhead
export interface ArrowEnd {
  binding?: ArrowBinding;
  hasArrowhead: boolean;
  point: Point;
}

export const arrowEndSchema: z.ZodObject<{
  binding: z.ZodOptional<typeof arrowBindingSchema>;
  hasArrowhead: z.ZodBoolean;
  point: typeof pointSchema;
}> = z.object({
  binding: arrowBindingSchema.optional(),
  hasArrowhead: z.boolean(),
  point: pointSchema,
}) satisfies z.ZodType<ArrowEnd>;
