import { z } from "zod";

// The line an outline or a route draws in: unbroken, in dashes or in dots
export const DashPattern = { Dashed: "dashed", Dotted: "dotted", Solid: "solid" } as const;
export type DashPattern = (typeof DashPattern)[keyof typeof DashPattern];

export const dashPatternSchema: z.ZodEnum<typeof DashPattern> = z.enum(DashPattern) satisfies z.ZodType<DashPattern>;
