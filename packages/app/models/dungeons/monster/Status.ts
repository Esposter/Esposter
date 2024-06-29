import { z } from "zod";
// This is different from stats and is more dynamic
// as it reflects the current status based on gameplay
export interface Status {
  hp: number;
  exp: number;
}

export const statusSchema = z.object({
  hp: z.number().int().nonnegative(),
  exp: z.number().int().nonnegative(),
}) satisfies z.ZodType<Status>;
