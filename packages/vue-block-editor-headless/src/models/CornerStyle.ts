import { z } from "zod";

// A shape's corners: sharp, or round with a radius that grows with the shape's size up to a limit
export enum CornerStyle {
  Round = "round",
  Sharp = "sharp",
}

export const cornerStyleSchema: z.ZodEnum<typeof CornerStyle> = z.enum(CornerStyle) satisfies z.ZodType<CornerStyle>;
