import { z } from "zod";

// One item finishing a quest series gives: its id in the game's tables, how many, and its rarity in stars, which colours
// Its tile
export interface QuestReward {
  count: number;
  itemId: number;
  rarity: number;
}

export const questRewardSchema = z.object({
  count: z.int().positive(),
  itemId: z.int().positive(),
  rarity: z.int().min(1).max(5),
}) satisfies z.ZodType<QuestReward>;
