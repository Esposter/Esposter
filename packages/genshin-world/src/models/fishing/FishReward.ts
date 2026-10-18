import { z } from "zod";

// A catch's reward as the generated reward slice holds it: the id of its reward row and the items it gives, each with
// Its count, which a catch takes into the bag
export interface FishReward {
  rewardId: number;
  rewardItemList: { itemCount: number; itemId: number }[];
}

export const fishRewardSchema = z.object({
  rewardId: z.int().positive(),
  rewardItemList: z.array(z.object({ itemCount: z.int().positive(), itemId: z.int().positive() })),
}) satisfies z.ZodType<FishReward>;
