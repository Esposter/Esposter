import { z } from "zod";

// The line an outline or a route draws in: unbroken, in dashes or in dots
export enum DashPattern {
  Dashed = "dashed",
  Dotted = "dotted",
  Solid = "solid",
}

export const dashPatternSchema: z.ZodEnum<typeof DashPattern> = z.enum(DashPattern) satisfies z.ZodType<DashPattern>;
