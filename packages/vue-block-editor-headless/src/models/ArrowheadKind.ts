import { z } from "zod";

// The filled shape an arrow's end draws at its tip: a triangle, a diamond, a circle or a bar across the line. An end with no arrowhead holds no kind,
// Since an enum takes no member for absence
export enum ArrowheadKind {
  Bar = "bar",
  Circle = "circle",
  Diamond = "diamond",
  Triangle = "triangle",
}

export const arrowheadKindSchema: z.ZodEnum<typeof ArrowheadKind> = z.enum(
  ArrowheadKind,
) satisfies z.ZodType<ArrowheadKind>;
