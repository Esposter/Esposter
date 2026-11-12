import type { HorizontalAlignment } from "#src/models/HorizontalAlignment";
import type { ItemEntityType } from "@esposter/shared";

import { elementColorSchema } from "#src/models/ElementColor";
import { horizontalAlignmentSchema } from "#src/models/HorizontalAlignment";
import { PositionedElementType } from "#src/models/PositionedElementType";
import { TextSize, textSizeSchema } from "#src/models/TextSize";
import { z } from "zod";

// A text box: text drawn in its colour, at its size and at the alignment it sets, which is its left edge when left out. Wrapped at the width the person
// Set, or unwrapped in auto width, where its width is its widest line. It stores no height, since its height follows from the lines its text wraps to
export interface TextElement extends ItemEntityType<PositionedElementType.Text> {
  color: string;
  horizontalAlignment?: HorizontalAlignment;
  id: string;
  isWrapped: boolean;
  text: string;
  textSize: TextSize;
  width: number;
  x: number;
  y: number;
}

export const textElementSchema: z.ZodObject<{
  color: z.ZodDefault<typeof elementColorSchema>;
  horizontalAlignment: z.ZodOptional<typeof horizontalAlignmentSchema>;
  id: z.ZodUUID;
  isWrapped: z.ZodDefault<z.ZodBoolean>;
  text: z.ZodString;
  textSize: z.ZodDefault<typeof textSizeSchema>;
  type: z.ZodLiteral<PositionedElementType.Text>;
  width: z.ZodNumber;
  x: z.ZodNumber;
  y: z.ZodNumber;
}> = z.object({
  color: elementColorSchema.default(""),
  horizontalAlignment: horizontalAlignmentSchema.optional(),
  id: z.uuidv4(),
  isWrapped: z.boolean().default(true),
  text: z.string(),
  textSize: textSizeSchema.default(TextSize.Small),
  type: z.literal(PositionedElementType.Text),
  width: z.number().positive(),
  x: z.number(),
  y: z.number(),
}) satisfies z.ZodType<TextElement>;
