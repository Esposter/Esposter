import type { ItemCount } from "#src/models/inventory/ItemCount";

import { itemCountSchema } from "#src/models/inventory/ItemCount";
import { z } from "zod";

// What a Reputation level, request or bounty pays: the Reputation EXP of its nation, which the game pays in its own item,
// And the other items it gives
export interface ReputationReward {
  exp: number;
  items: ItemCount[];
}

export const reputationRewardSchema = z.object({
  exp: z.int().nonnegative(),
  items: z.array(itemCountSchema),
}) satisfies z.ZodType<ReputationReward>;
