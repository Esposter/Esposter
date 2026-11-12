import { SketchLevel, sketchLevelSchema } from "#src/models/SketchLevel";
import { StrokeWidth, strokeWidthSchema } from "#src/models/StrokeWidth";
import { TextSize, textSizeSchema } from "#src/models/TextSize";
import { z } from "zod";

// The look a box with text shares: the sketch level and width its outline draws at, and the text it holds at its size
export interface TextBoxElement {
  sketchLevel: SketchLevel;
  strokeWidth: StrokeWidth;
  text: string;
  textSize: TextSize;
}

export const textBoxElementSchema: z.ZodObject<{
  sketchLevel: z.ZodDefault<typeof sketchLevelSchema>;
  strokeWidth: z.ZodDefault<typeof strokeWidthSchema>;
  text: z.ZodString;
  textSize: z.ZodDefault<typeof textSizeSchema>;
}> = z.object({
  sketchLevel: sketchLevelSchema.default(SketchLevel.Artist),
  strokeWidth: strokeWidthSchema.default(StrokeWidth.Medium),
  text: z.string(),
  textSize: textSizeSchema.default(TextSize.Small),
}) satisfies z.ZodType<TextBoxElement>;
