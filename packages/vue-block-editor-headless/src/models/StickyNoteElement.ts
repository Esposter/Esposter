import type { BoxElement } from "#src/models/BoxElement";
import type { HorizontalAlignment } from "#src/models/HorizontalAlignment";
import type { TextBoxElement } from "#src/models/TextBoxElement";
import type { VerticalAlignment } from "#src/models/VerticalAlignment";
import type { ItemEntityType } from "@esposter/shared";

import { boxElementSchema } from "#src/models/BoxElement";
import { DashPattern, dashPatternSchema } from "#src/models/DashPattern";
import { elementColorSchema } from "#src/models/ElementColor";
import { horizontalAlignmentSchema } from "#src/models/HorizontalAlignment";
import { PositionedElementType } from "#src/models/PositionedElementType";
import { textBoxElementSchema } from "#src/models/TextBoxElement";
import { verticalAlignmentSchema } from "#src/models/VerticalAlignment";
import { HEX_COLOR_REGEX } from "#src/services/constants";
import { z } from "zod";

// A sticky note: a box with a fill and text, drawn in the sticky-note look. Its outline draws in its colour, at its width, in its dash pattern and at
// its sketch level. Its text draws at its size, and at the alignments it sets, which the note takes by default until one is set
export interface StickyNoteElement
  extends BoxElement, ItemEntityType<PositionedElementType.StickyNote>, TextBoxElement {
  color: string;
  dashPattern: DashPattern;
  fill: string;
  horizontalAlignment?: HorizontalAlignment;
  verticalAlignment?: VerticalAlignment;
}

export const stickyNoteElementSchema: z.ZodObject<
  typeof boxElementSchema.shape &
    typeof textBoxElementSchema.shape & {
      color: z.ZodDefault<typeof elementColorSchema>;
      dashPattern: z.ZodDefault<typeof dashPatternSchema>;
      fill: z.ZodString;
      horizontalAlignment: z.ZodOptional<typeof horizontalAlignmentSchema>;
      type: z.ZodLiteral<PositionedElementType.StickyNote>;
      verticalAlignment: z.ZodOptional<typeof verticalAlignmentSchema>;
    }
> = z.object({
  ...boxElementSchema.shape,
  ...textBoxElementSchema.shape,
  color: elementColorSchema.default(""),
  dashPattern: dashPatternSchema.default(DashPattern.Solid),
  fill: z.string().regex(HEX_COLOR_REGEX),
  horizontalAlignment: horizontalAlignmentSchema.optional(),
  type: z.literal(PositionedElementType.StickyNote),
  verticalAlignment: verticalAlignmentSchema.optional(),
}) satisfies z.ZodType<StickyNoteElement>;
