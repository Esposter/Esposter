import { z } from "zod";

// The four sizes a text draws at, each the size of its font in document units. Small is the size every text drew at before a size could be chosen
export enum TextSize {
  ExtraLarge = 36,
  Large = 28,
  Medium = 20,
  Small = 16,
}

export const textSizeSchema: z.ZodEnum<typeof TextSize> = z.enum(TextSize) satisfies z.ZodType<TextSize>;
