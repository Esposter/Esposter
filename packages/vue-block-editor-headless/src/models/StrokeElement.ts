import type { Point } from "#src/models/Point";
import type { StrokeWidth } from "#src/models/StrokeWidth";
import type { ItemEntityType } from "@esposter/shared";

import { elementColorSchema } from "#src/models/ElementColor";
import { pointSchema } from "#src/models/Point";
import { PositionedElementType } from "#src/models/PositionedElementType";
import { strokeWidthSchema } from "#src/models/StrokeWidth";
import { z } from "zod";

// A freehand stroke: the path of points the pointer took, drawn in its colour at one of the three stroke widths
export interface StrokeElement extends ItemEntityType<PositionedElementType.Stroke> {
  color: string;
  id: string;
  points: Point[];
  strokeWidth: StrokeWidth;
}

export const strokeElementSchema: z.ZodObject<{
  color: z.ZodDefault<typeof elementColorSchema>;
  id: z.ZodUUID;
  points: z.ZodArray<typeof pointSchema>;
  strokeWidth: typeof strokeWidthSchema;
  type: z.ZodLiteral<PositionedElementType.Stroke>;
}> = z.object({
  color: elementColorSchema.default(""),
  id: z.uuidv4(),
  points: z.array(pointSchema).min(1),
  strokeWidth: strokeWidthSchema,
  type: z.literal(PositionedElementType.Stroke),
}) satisfies z.ZodType<StrokeElement>;
