import type { ItemEntityType } from "@esposter/shared";

import { elementColorSchema } from "#src/models/ElementColor";
import { PositionedElementType } from "#src/models/PositionedElementType";
import { z } from "zod";

// A text box: text wrapped at the width the person set, drawn in its colour. It stores no height, since its height follows from the lines its text wraps to
export interface TextElement extends ItemEntityType<PositionedElementType.Text> {
  color: string;
  id: string;
  text: string;
  width: number;
  x: number;
  y: number;
}

export const textElementSchema: z.ZodObject<{
  color: z.ZodDefault<typeof elementColorSchema>;
  id: z.ZodUUID;
  text: z.ZodString;
  type: z.ZodLiteral<PositionedElementType.Text>;
  width: z.ZodNumber;
  x: z.ZodNumber;
  y: z.ZodNumber;
}> = z.object({
  color: elementColorSchema.default(""),
  id: z.uuidv4(),
  text: z.string(),
  type: z.literal(PositionedElementType.Text),
  width: z.number().positive(),
  x: z.number(),
  y: z.number(),
}) satisfies z.ZodType<TextElement>;
