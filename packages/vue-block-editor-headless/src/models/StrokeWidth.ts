import { z } from "zod";

// The three widths an outline, an arrow or a freehand stroke draws at, in document units. Medium is the width each drew at before a width could be chosen
export enum StrokeWidth {
  Bold = 4,
  Medium = 2,
  Thin = 1,
}

export const strokeWidthSchema: z.ZodEnum<typeof StrokeWidth> = z.enum(StrokeWidth) satisfies z.ZodType<StrokeWidth>;
