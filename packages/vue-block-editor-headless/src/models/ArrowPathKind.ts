import { z } from "zod";

// The route an arrow takes between its two ends
export const ArrowPathKind = { Curved: "curved", RightAngled: "rightAngled", Straight: "straight" } as const;
export type ArrowPathKind = (typeof ArrowPathKind)[keyof typeof ArrowPathKind];

export const arrowPathKindSchema: z.ZodEnum<typeof ArrowPathKind> = z.enum(
  ArrowPathKind,
) satisfies z.ZodType<ArrowPathKind>;
