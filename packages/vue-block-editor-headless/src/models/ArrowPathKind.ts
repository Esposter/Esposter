import { z } from "zod";

// The route an arrow takes between its two ends
export enum ArrowPathKind {
  Curved = "curved",
  RightAngled = "rightAngled",
  Straight = "straight",
}

export const arrowPathKindSchema: z.ZodEnum<typeof ArrowPathKind> = z.enum(
  ArrowPathKind,
) satisfies z.ZodType<ArrowPathKind>;
