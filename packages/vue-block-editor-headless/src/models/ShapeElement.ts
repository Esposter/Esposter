import type { BoxElement } from "#src/models/BoxElement";
import type { ShapeKind } from "#src/models/ShapeKind";
import type { ItemEntityType } from "@esposter/shared";

import { boxElementSchema } from "#src/models/BoxElement";
import { DashPattern, dashPatternSchema } from "#src/models/DashPattern";
import { elementColorSchema } from "#src/models/ElementColor";
import { PositionedElementType } from "#src/models/PositionedElementType";
import { shapeKindSchema } from "#src/models/ShapeKind";
import { StrokeWidth, strokeWidthSchema } from "#src/models/StrokeWidth";
import { z } from "zod";

// A shape: an outline of one kind, placed by its box, with a fill and text its box holds. Its outline draws in its colour, at its width and in its dash pattern
export interface ShapeElement extends BoxElement, ItemEntityType<PositionedElementType.Shape> {
  color: string;
  dashPattern: DashPattern;
  fill: string;
  kind: ShapeKind;
  strokeWidth: StrokeWidth;
  text: string;
}

export const shapeElementSchema: z.ZodObject<
  typeof boxElementSchema.shape & {
    color: z.ZodDefault<typeof elementColorSchema>;
    dashPattern: z.ZodDefault<typeof dashPatternSchema>;
    fill: typeof elementColorSchema;
    kind: typeof shapeKindSchema;
    strokeWidth: z.ZodDefault<typeof strokeWidthSchema>;
    text: z.ZodString;
    type: z.ZodLiteral<PositionedElementType.Shape>;
  }
> = z.object({
  ...boxElementSchema.shape,
  color: elementColorSchema.default(""),
  dashPattern: dashPatternSchema.default(DashPattern.Solid),
  fill: elementColorSchema,
  kind: shapeKindSchema,
  strokeWidth: strokeWidthSchema.default(StrokeWidth.Medium),
  text: z.string(),
  type: z.literal(PositionedElementType.Shape),
}) satisfies z.ZodType<ShapeElement>;
