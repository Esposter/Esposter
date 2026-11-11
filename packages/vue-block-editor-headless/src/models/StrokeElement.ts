import type { Point } from "#src/models/Point";
import type { ItemEntityType } from "@esposter/shared";

import { pointSchema } from "#src/models/Point";
import { PositionedElementType } from "#src/models/PositionedElementType";
import { z } from "zod";

// A freehand stroke: the path of points the pointer took, drawn at a stroke width
export interface StrokeElement extends ItemEntityType<PositionedElementType.Stroke> {
  id: string;
  points: Point[];
  strokeWidth: number;
}

export const strokeElementSchema: z.ZodObject<{
  id: z.ZodUUID;
  points: z.ZodArray<typeof pointSchema>;
  strokeWidth: z.ZodNumber;
  type: z.ZodLiteral<PositionedElementType.Stroke>;
}> = z.object({
  id: z.uuidv4(),
  points: z.array(pointSchema).min(1),
  strokeWidth: z.number().positive(),
  type: z.literal(PositionedElementType.Stroke),
}) satisfies z.ZodType<StrokeElement>;
