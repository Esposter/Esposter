import type { ArrowEnd } from "#src/models/ArrowEnd";
import type { ArrowPathKind } from "#src/models/ArrowPathKind";
import type { ItemEntityType } from "@esposter/shared";

import { arrowEndSchema } from "#src/models/ArrowEnd";
import { arrowPathKindSchema } from "#src/models/ArrowPathKind";
import { DashPattern, dashPatternSchema } from "#src/models/DashPattern";
import { elementColorSchema } from "#src/models/ElementColor";
import { PositionedElementType } from "#src/models/PositionedElementType";
import { StrokeWidth, strokeWidthSchema } from "#src/models/StrokeWidth";
import { z } from "zod";

// An arrow: two ends, each bound to a shape's connection point or free, with its path kind and the text it owns as its label. Its route and arrowheads draw in its colour, at its width and in its dash pattern
export interface ArrowElement extends ItemEntityType<PositionedElementType.Arrow> {
  color: string;
  dashPattern: DashPattern;
  end: ArrowEnd;
  id: string;
  label: string;
  pathKind: ArrowPathKind;
  start: ArrowEnd;
  strokeWidth: StrokeWidth;
}

export const arrowElementSchema: z.ZodObject<{
  color: z.ZodDefault<typeof elementColorSchema>;
  dashPattern: z.ZodDefault<typeof dashPatternSchema>;
  end: typeof arrowEndSchema;
  id: z.ZodUUID;
  label: z.ZodString;
  pathKind: typeof arrowPathKindSchema;
  start: typeof arrowEndSchema;
  strokeWidth: z.ZodDefault<typeof strokeWidthSchema>;
  type: z.ZodLiteral<PositionedElementType.Arrow>;
}> = z.object({
  color: elementColorSchema.default(""),
  dashPattern: dashPatternSchema.default(DashPattern.Solid),
  end: arrowEndSchema,
  id: z.uuidv4(),
  label: z.string(),
  pathKind: arrowPathKindSchema,
  start: arrowEndSchema,
  strokeWidth: strokeWidthSchema.default(StrokeWidth.Medium),
  type: z.literal(PositionedElementType.Arrow),
}) satisfies z.ZodType<ArrowElement>;
