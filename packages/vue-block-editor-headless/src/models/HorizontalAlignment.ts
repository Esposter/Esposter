import { z } from "zod";

// Where a text sits across its element: from its left edge, centred, or to its right edge
export const HorizontalAlignment = { Center: "center", Left: "left", Right: "right" } as const;
export type HorizontalAlignment = (typeof HorizontalAlignment)[keyof typeof HorizontalAlignment];

export const horizontalAlignmentSchema: z.ZodEnum<typeof HorizontalAlignment> = z.enum(
  HorizontalAlignment,
) satisfies z.ZodType<HorizontalAlignment>;
