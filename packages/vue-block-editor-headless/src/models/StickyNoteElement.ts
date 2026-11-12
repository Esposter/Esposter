import type { BoxElement } from "#src/models/BoxElement";
import type { HorizontalAlignment } from "#src/models/HorizontalAlignment";
import type { VerticalAlignment } from "#src/models/VerticalAlignment";
import type { ItemEntityType } from "@esposter/shared";

import { boxElementSchema } from "#src/models/BoxElement";
import { DashPattern, dashPatternSchema } from "#src/models/DashPattern";
import { elementColorSchema } from "#src/models/ElementColor";
import { horizontalAlignmentSchema } from "#src/models/HorizontalAlignment";
import { PositionedElementType } from "#src/models/PositionedElementType";
import { SketchLevel, sketchLevelSchema } from "#src/models/SketchLevel";
import { StrokeWidth, strokeWidthSchema } from "#src/models/StrokeWidth";
import { TextSize, textSizeSchema } from "#src/models/TextSize";
import { verticalAlignmentSchema } from "#src/models/VerticalAlignment";
import { HEX_COLOR_REGEX } from "#src/services/constants";
import { z } from "zod";

// A sticky note: a box with a fill and text, drawn in the sticky-note look. Its outline draws in its colour, at its width, in its dash pattern and at
// its sketch level. Its text draws at its size, and at the alignments it sets, which the note takes by default until one is set
export interface StickyNoteElement extends BoxElement, ItemEntityType<PositionedElementType.StickyNote> {
  color: string;
  dashPattern: DashPattern;
  fill: string;
  horizontalAlignment?: HorizontalAlignment;
  sketchLevel: SketchLevel;
  strokeWidth: StrokeWidth;
  text: string;
  textSize: TextSize;
  verticalAlignment?: VerticalAlignment;
}

export const stickyNoteElementSchema: z.ZodObject<
  typeof boxElementSchema.shape & {
    color: z.ZodDefault<typeof elementColorSchema>;
    dashPattern: z.ZodDefault<typeof dashPatternSchema>;
    fill: z.ZodString;
    horizontalAlignment: z.ZodOptional<typeof horizontalAlignmentSchema>;
    sketchLevel: z.ZodDefault<typeof sketchLevelSchema>;
    strokeWidth: z.ZodDefault<typeof strokeWidthSchema>;
    text: z.ZodString;
    textSize: z.ZodDefault<typeof textSizeSchema>;
    type: z.ZodLiteral<PositionedElementType.StickyNote>;
    verticalAlignment: z.ZodOptional<typeof verticalAlignmentSchema>;
  }
> = z.object({
  ...boxElementSchema.shape,
  color: elementColorSchema.default(""),
  dashPattern: dashPatternSchema.default(DashPattern.Solid),
  fill: z.string().regex(HEX_COLOR_REGEX),
  horizontalAlignment: horizontalAlignmentSchema.optional(),
  sketchLevel: sketchLevelSchema.default(SketchLevel.Artist),
  strokeWidth: strokeWidthSchema.default(StrokeWidth.Medium),
  text: z.string(),
  textSize: textSizeSchema.default(TextSize.Small),
  type: z.literal(PositionedElementType.StickyNote),
  verticalAlignment: verticalAlignmentSchema.optional(),
}) satisfies z.ZodType<StickyNoteElement>;
