import { z } from "zod";

// One item a statue level pays, as the game's reward table lists it: its item and how many
export interface StatueReward {
  itemCount: number;
  itemId: number;
}

export const statueRewardSchema = z.object({
  itemCount: z.int().positive(),
  itemId: z.int().positive(),
}) satisfies z.ZodType<StatueReward>;
