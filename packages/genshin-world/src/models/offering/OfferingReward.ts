import { z } from "zod";

// One item an offering level pays, as the game's reward table lists it: its item and how many
export interface OfferingReward {
  itemCount: number;
  itemId: number;
}

export const offeringRewardSchema = z.object({
  itemCount: z.int().positive(),
  itemId: z.int().positive(),
}) satisfies z.ZodType<OfferingReward>;
