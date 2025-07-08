import { z } from "zod/v4";
// This is different from stats and is more dynamic
// as it reflects the current status based on gameplay
export interface Status {
  exp: number;
  hp: number;
}

export const statusSchema = z.object({
  exp: z.int().nonnegative(),
  hp: z.int().nonnegative(),
}) satisfies z.ZodType<Status>;
