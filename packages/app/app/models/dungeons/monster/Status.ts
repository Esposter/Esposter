import { z } from "zod";
// This is different from stats and is more dynamic
// as it reflects the current status based on gameplay
export interface Status {
  exp: number;
  hp: number;
}

export const statusSchema = z.object({
  exp: z.number().int().nonnegative(),
  hp: z.number().int().nonnegative(),
}) satisfies z.ZodType<Status>;
