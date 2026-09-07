import { z } from "zod";
// What gameplay has done to the monster so far, as opposed to the statistics it was defined with
export interface Status {
  experience: number;
  health: number;
}

export const statusSchema = z.object({
  experience: z.int().nonnegative(),
  health: z.int().nonnegative(),
}) satisfies z.ZodType<Status>;
