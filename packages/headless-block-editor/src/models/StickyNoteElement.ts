import type { BoxElement } from "#src/models/BoxElement";
import type { ItemEntityType } from "@esposter/shared";

import { boxElementSchema } from "#src/models/BoxElement";
import { PositionedElementType } from "#src/models/PositionedElementType";
import { HEX_COLOR_REGEX } from "#src/services/constants";
import { z } from "zod";

// A sticky note: a box with a fill and text, drawn in the sticky-note look
export interface StickyNoteElement extends BoxElement, ItemEntityType<PositionedElementType.StickyNote> {
  fill: string;
  text: string;
}

export const stickyNoteElementSchema: z.ZodObject<
  typeof boxElementSchema.shape & {
    fill: z.ZodString;
    text: z.ZodString;
    type: z.ZodLiteral<PositionedElementType.StickyNote>;
  }
> = z.object({
  ...boxElementSchema.shape,
  fill: z.string().regex(HEX_COLOR_REGEX),
  text: z.string(),
  type: z.literal(PositionedElementType.StickyNote),
}) satisfies z.ZodType<StickyNoteElement>;
