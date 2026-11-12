import { z } from "zod";

// The four sizes a text draws at, each the size of its font in document units. Small is the size every text drew at before a size could be chosen
export enum TextSize {
  Small = 16,
  Medium = 20,
  Large = 28,
  ExtraLarge = 36,
}

export const textSizeSchema: z.ZodEnum<typeof TextSize> = z.enum(TextSize) satisfies z.ZodType<TextSize>;
