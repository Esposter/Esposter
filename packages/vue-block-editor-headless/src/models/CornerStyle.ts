import { z } from "zod";

// A shape's corners: sharp, or round with a radius that grows with the shape's size up to a limit
export const CornerStyle = { Round: "round", Sharp: "sharp" } as const;
export type CornerStyle = (typeof CornerStyle)[keyof typeof CornerStyle];

export const cornerStyleSchema: z.ZodEnum<typeof CornerStyle> = z.enum(CornerStyle) satisfies z.ZodType<CornerStyle>;
