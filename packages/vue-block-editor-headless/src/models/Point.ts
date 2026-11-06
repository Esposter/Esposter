import { z } from "zod";

// A position in document units
export interface Point {
  x: number;
  y: number;
}

export const pointSchema: z.ZodObject<{ x: z.ZodNumber; y: z.ZodNumber }> = z.object({
  x: z.number(),
  y: z.number(),
}) satisfies z.ZodType<Point>;
