import { z } from "zod";

// Where a text sits down its element: from its top edge, centred, or from its bottom edge
export enum VerticalAlignment {
  Bottom = "bottom",
  Middle = "middle",
  Top = "top",
}

export const verticalAlignmentSchema: z.ZodEnum<typeof VerticalAlignment> = z.enum(
  VerticalAlignment,
) satisfies z.ZodType<VerticalAlignment>;
