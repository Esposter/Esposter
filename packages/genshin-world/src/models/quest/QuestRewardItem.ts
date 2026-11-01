import { z } from "zod";

// One item a quest's finish pays: its id in the game's tables and how many of it
export interface QuestRewardItem {
  count: number;
  itemId: number;
}

export const questRewardItemSchema = z.object({
  count: z.int().positive(),
  itemId: z.int().positive(),
}) satisfies z.ZodType<QuestRewardItem>;
