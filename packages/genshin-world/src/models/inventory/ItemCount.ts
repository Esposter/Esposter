import { z } from "zod";

// So many of one item, by its id in the game's tables: what an ascension or an enhancement takes from the bag
export interface ItemCount {
  count: number;
  id: number;
}

export const itemCountSchema = z.object({
  count: z.int().positive(),
  id: z.int().positive(),
}) satisfies z.ZodType<ItemCount>;
