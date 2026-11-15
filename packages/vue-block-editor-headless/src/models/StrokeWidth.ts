import { z } from "zod";

// The three widths an outline, an arrow or a freehand stroke draws at, in document units. Medium is the width each drew at before a width could be chosen
export const StrokeWidth = { Thin: 1, Medium: 2, Bold: 4 } as const;
export type StrokeWidth = (typeof StrokeWidth)[keyof typeof StrokeWidth];

export const strokeWidthSchema: z.ZodEnum<typeof StrokeWidth> = z.enum(StrokeWidth) satisfies z.ZodType<StrokeWidth>;
