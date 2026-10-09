import { z } from "zod";

// One item a claim of an expedition gives: its id in the game's tables, and the least and most of it a claim may draw,
// Its count drawn from that range by the world's random source
export interface ExpeditionRewardItem {
  itemId: number;
  maxCount: number;
  minCount: number;
}

export const expeditionRewardItemSchema = z.object({
  itemId: z.int().positive(),
  maxCount: z.int().positive(),
  minCount: z.int().positive(),
}) satisfies z.ZodType<ExpeditionRewardItem>;
