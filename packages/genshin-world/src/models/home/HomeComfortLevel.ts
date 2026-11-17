import { z } from "zod";

// One Adeptal Energy rank: the comfort a realm must reach for it, and the Realm Currency and Realm Bounty each produces per
// Hour of it at that rank
export interface HomeComfortLevel {
  bountyRate: number;
  coinRate: number;
  comfort: number;
  level: number;
}

export const homeComfortLevelSchema = z.object({
  bountyRate: z.int().nonnegative(),
  coinRate: z.int().nonnegative(),
  comfort: z.int().nonnegative(),
  level: z.int().positive(),
}) satisfies z.ZodType<HomeComfortLevel>;
