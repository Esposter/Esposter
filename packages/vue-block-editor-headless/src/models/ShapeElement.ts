import type { BoxElement } from "#src/models/BoxElement";
import type { HorizontalAlignment } from "#src/models/HorizontalAlignment";
import type { ShapeKind } from "#src/models/ShapeKind";
import type { TextBoxElement } from "#src/models/TextBoxElement";
import type { VerticalAlignment } from "#src/models/VerticalAlignment";
import type { ItemEntityType } from "@esposter/shared";

import { boxElementSchema } from "#src/models/BoxElement";
import { CornerStyle, cornerStyleSchema } from "#src/models/CornerStyle";
import { DashPattern, dashPatternSchema } from "#src/models/DashPattern";
import { elementColorSchema } from "#src/models/ElementColor";
import { horizontalAlignmentSchema } from "#src/models/HorizontalAlignment";
import { PositionedElementType } from "#src/models/PositionedElementType";
import { shapeKindSchema } from "#src/models/ShapeKind";
import { textBoxElementSchema } from "#src/models/TextBoxElement";
import { verticalAlignmentSchema } from "#src/models/VerticalAlignment";
import { z } from "zod";

// A shape: an outline of one kind, placed by its box, with a fill and text its box holds. Its outline draws in its colour, at its width, in its dash
// Pattern and at its sketch level, and with round corners when its corner style is round. Its text draws at its size, and at the alignments it sets,
// which its kind takes until one is set
export interface ShapeElement extends BoxElement, ItemEntityType<PositionedElementType.Shape>, TextBoxElement {
  color: string;
  cornerStyle: CornerStyle;
  dashPattern: DashPattern;
  fill: string;
  horizontalAlignment?: HorizontalAlignment;
  kind: ShapeKind;
  verticalAlignment?: VerticalAlignment;
}

export const shapeElementSchema: z.ZodObject<
  typeof boxElementSchema.shape &
    typeof textBoxElementSchema.shape & {
      color: z.ZodDefault<typeof elementColorSchema>;
      cornerStyle: z.ZodDefault<typeof cornerStyleSchema>;
      dashPattern: z.ZodDefault<typeof dashPatternSchema>;
      fill: typeof elementColorSchema;
      horizontalAlignment: z.ZodOptional<typeof horizontalAlignmentSchema>;
      kind: typeof shapeKindSchema;
      type: z.ZodLiteral<PositionedElementType.Shape>;
      verticalAlignment: z.ZodOptional<typeof verticalAlignmentSchema>;
    }
> = z.object({
  ...boxElementSchema.shape,
  ...textBoxElementSchema.shape,
  color: elementColorSchema.default(""),
  cornerStyle: cornerStyleSchema.default(CornerStyle.Sharp),
  dashPattern: dashPatternSchema.default(DashPattern.Solid),
  fill: elementColorSchema,
  horizontalAlignment: horizontalAlignmentSchema.optional(),
  kind: shapeKindSchema,
  type: z.literal(PositionedElementType.Shape),
  verticalAlignment: verticalAlignmentSchema.optional(),
}) satisfies z.ZodType<ShapeElement>;
