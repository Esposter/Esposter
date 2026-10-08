import { z } from "zod";

// One rank of the game's player level table: the Adventure EXP that takes the player from it to the next
export interface AdventureRankLevel {
  exp: number;
  level: number;
}

export const adventureRankLevelSchema = z.object({
  exp: z.int().nonnegative(),
  level: z.int().min(1),
}) satisfies z.ZodType<AdventureRankLevel>;
