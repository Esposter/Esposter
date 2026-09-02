import { z } from "zod";
// This is different from statistics and is more dynamic
// As it reflects the current status based on gameplay
export interface Status {
  experience: number;
  health: number;
}

export const statusSchema = z.object({
  experience: z.int().nonnegative(),
  health: z.int().nonnegative(),
}) satisfies z.ZodType<Status>;
