import { z } from "zod";

// Where a text sits down its element: from its top edge, centred, or from its bottom edge
export const VerticalAlignment = { Bottom: "bottom", Middle: "middle", Top: "top" } as const;
export type VerticalAlignment = (typeof VerticalAlignment)[keyof typeof VerticalAlignment];

export const verticalAlignmentSchema: z.ZodEnum<typeof VerticalAlignment> = z.enum(
  VerticalAlignment,
) satisfies z.ZodType<VerticalAlignment>;
