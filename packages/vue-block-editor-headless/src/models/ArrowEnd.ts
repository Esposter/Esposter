import type { ArrowBinding } from "#src/models/ArrowBinding";
import type { ArrowheadKind } from "#src/models/ArrowheadKind";
import type { Point } from "#src/models/Point";

import { arrowBindingSchema } from "#src/models/ArrowBinding";
import { arrowheadKindSchema } from "#src/models/ArrowheadKind";
import { pointSchema } from "#src/models/Point";
import { z } from "zod";

// One end of an arrow: the point it sits at, its binding when it is bound to a shape, and the arrowhead it draws, which is absent for an end with none.
// The end is strict, so a stored end that still holds the old arrowhead flag fails its parse until it is rewritten
export interface ArrowEnd {
  arrowhead?: ArrowheadKind;
  binding?: ArrowBinding;
  point: Point;
}

export const arrowEndSchema: z.ZodObject<
  {
    arrowhead: z.ZodOptional<typeof arrowheadKindSchema>;
    binding: z.ZodOptional<typeof arrowBindingSchema>;
    point: typeof pointSchema;
  },
  z.core.$strict
> = z.strictObject({
  arrowhead: arrowheadKindSchema.optional(),
  binding: arrowBindingSchema.optional(),
  point: pointSchema,
}) satisfies z.ZodType<ArrowEnd>;
