import type { BoxElement } from "#src/models/BoxElement";
import type { ItemEntityType } from "@esposter/shared";

import { boxElementSchema } from "#src/models/BoxElement";
import { DashPattern, dashPatternSchema } from "#src/models/DashPattern";
import { elementColorSchema } from "#src/models/ElementColor";
import { PositionedElementType } from "#src/models/PositionedElementType";
import { StrokeWidth, strokeWidthSchema } from "#src/models/StrokeWidth";
import { HEX_COLOR_REGEX } from "#src/services/constants";
import { z } from "zod";

// A sticky note: a box with a fill and text, drawn in the sticky-note look. Its outline draws in its colour, at its width and in its dash pattern
export interface StickyNoteElement extends BoxElement, ItemEntityType<PositionedElementType.StickyNote> {
  color: string;
  dashPattern: DashPattern;
  fill: string;
  strokeWidth: StrokeWidth;
  text: string;
}

export const stickyNoteElementSchema: z.ZodObject<
  typeof boxElementSchema.shape & {
    color: z.ZodDefault<typeof elementColorSchema>;
    dashPattern: z.ZodDefault<typeof dashPatternSchema>;
    fill: z.ZodString;
    strokeWidth: z.ZodDefault<typeof strokeWidthSchema>;
    text: z.ZodString;
    type: z.ZodLiteral<PositionedElementType.StickyNote>;
  }
> = z.object({
  ...boxElementSchema.shape,
  color: elementColorSchema.default(""),
  dashPattern: dashPatternSchema.default(DashPattern.Solid),
  fill: z.string().regex(HEX_COLOR_REGEX),
  strokeWidth: strokeWidthSchema.default(StrokeWidth.Medium),
  text: z.string(),
  type: z.literal(PositionedElementType.StickyNote),
}) satisfies z.ZodType<StickyNoteElement>;
