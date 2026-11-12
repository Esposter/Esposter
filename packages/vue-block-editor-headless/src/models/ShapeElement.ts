import type { BoxElement } from "#src/models/BoxElement";
import type { ShapeKind } from "#src/models/ShapeKind";
import type { ItemEntityType } from "@esposter/shared";

import { boxElementSchema } from "#src/models/BoxElement";
import { CornerStyle, cornerStyleSchema } from "#src/models/CornerStyle";
import { DashPattern, dashPatternSchema } from "#src/models/DashPattern";
import { elementColorSchema } from "#src/models/ElementColor";
import { PositionedElementType } from "#src/models/PositionedElementType";
import { shapeKindSchema } from "#src/models/ShapeKind";
import { SketchLevel, sketchLevelSchema } from "#src/models/SketchLevel";
import { StrokeWidth, strokeWidthSchema } from "#src/models/StrokeWidth";
import { z } from "zod";

// A shape: an outline of one kind, placed by its box, with a fill and text its box holds. Its outline draws in its colour, at its width, in its dash
// Pattern and at its sketch level, and with round corners when its corner style is round
export interface ShapeElement extends BoxElement, ItemEntityType<PositionedElementType.Shape> {
  color: string;
  cornerStyle: CornerStyle;
  dashPattern: DashPattern;
  fill: string;
  kind: ShapeKind;
  sketchLevel: SketchLevel;
  strokeWidth: StrokeWidth;
  text: string;
}

export const shapeElementSchema: z.ZodObject<
  typeof boxElementSchema.shape & {
    color: z.ZodDefault<typeof elementColorSchema>;
    cornerStyle: z.ZodDefault<typeof cornerStyleSchema>;
    dashPattern: z.ZodDefault<typeof dashPatternSchema>;
    fill: typeof elementColorSchema;
    kind: typeof shapeKindSchema;
    sketchLevel: z.ZodDefault<typeof sketchLevelSchema>;
    strokeWidth: z.ZodDefault<typeof strokeWidthSchema>;
    text: z.ZodString;
    type: z.ZodLiteral<PositionedElementType.Shape>;
  }
> = z.object({
  ...boxElementSchema.shape,
  color: elementColorSchema.default(""),
  cornerStyle: cornerStyleSchema.default(CornerStyle.Sharp),
  dashPattern: dashPatternSchema.default(DashPattern.Solid),
  fill: elementColorSchema,
  kind: shapeKindSchema,
  sketchLevel: sketchLevelSchema.default(SketchLevel.Artist),
  strokeWidth: strokeWidthSchema.default(StrokeWidth.Medium),
  text: z.string(),
  type: z.literal(PositionedElementType.Shape),
}) satisfies z.ZodType<ShapeElement>;
