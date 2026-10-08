import { z } from "zod";

// A capital hall of storeys, each set back from the one below and standing on it, centred on the origin, in metres
export interface HallOptions {
  depth: number;
  setback: number;
  storeyCount: number;
  storeyHeight: number;
  width: number;
}

export const hallOptionsSchema = z.object({
  depth: z.number().positive(),
  setback: z.number().nonnegative(),
  storeyCount: z.int().positive(),
  storeyHeight: z.number().positive(),
  width: z.number().positive(),
}) satisfies z.ZodType<HallOptions>;
