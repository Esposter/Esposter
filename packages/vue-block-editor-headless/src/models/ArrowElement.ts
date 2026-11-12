import type { ArrowEnd } from "#src/models/ArrowEnd";
import type { ArrowPathKind } from "#src/models/ArrowPathKind";
import type { ItemEntityType } from "@esposter/shared";

import { arrowEndSchema } from "#src/models/ArrowEnd";
import { arrowPathKindSchema } from "#src/models/ArrowPathKind";
import { DashPattern, dashPatternSchema } from "#src/models/DashPattern";
import { elementColorSchema } from "#src/models/ElementColor";
import { PositionedElementType } from "#src/models/PositionedElementType";
import { SketchLevel, sketchLevelSchema } from "#src/models/SketchLevel";
import { StrokeWidth, strokeWidthSchema } from "#src/models/StrokeWidth";
import { TextSize, textSizeSchema } from "#src/models/TextSize";
import { z } from "zod";

// An arrow: two ends, each bound to a shape's connection point or free, with its path kind and the text it owns as its label. Its route and arrowheads draw in its colour, at its width, in its dash pattern and at its sketch level, and its label at its size
export interface ArrowElement extends ItemEntityType<PositionedElementType.Arrow> {
  color: string;
  dashPattern: DashPattern;
  end: ArrowEnd;
  id: string;
  label: string;
  pathKind: ArrowPathKind;
  sketchLevel: SketchLevel;
  start: ArrowEnd;
  strokeWidth: StrokeWidth;
  textSize: TextSize;
}

export const arrowElementSchema: z.ZodObject<{
  color: z.ZodDefault<typeof elementColorSchema>;
  dashPattern: z.ZodDefault<typeof dashPatternSchema>;
  end: typeof arrowEndSchema;
  id: z.ZodUUID;
  label: z.ZodString;
  pathKind: typeof arrowPathKindSchema;
  sketchLevel: z.ZodDefault<typeof sketchLevelSchema>;
  start: typeof arrowEndSchema;
  strokeWidth: z.ZodDefault<typeof strokeWidthSchema>;
  textSize: z.ZodDefault<typeof textSizeSchema>;
  type: z.ZodLiteral<PositionedElementType.Arrow>;
}> = z.object({
  color: elementColorSchema.default(""),
  dashPattern: dashPatternSchema.default(DashPattern.Solid),
  end: arrowEndSchema,
  id: z.uuidv4(),
  label: z.string(),
  pathKind: arrowPathKindSchema,
  sketchLevel: sketchLevelSchema.default(SketchLevel.Artist),
  start: arrowEndSchema,
  strokeWidth: strokeWidthSchema.default(StrokeWidth.Medium),
  textSize: textSizeSchema.default(TextSize.Small),
  type: z.literal(PositionedElementType.Arrow),
}) satisfies z.ZodType<ArrowElement>;
