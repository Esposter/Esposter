import type { ItemCount } from "#src/models/inventory/ItemCount";

import { itemCountSchema } from "#src/models/inventory/ItemCount";
import { z } from "zod";

// What entering an ascension phase costs: the Mora, the items and the Adventure Rank the player needs
export interface AscensionCost {
  coinCost: number;
  costItems: ItemCount[];
  requiredPlayerLevel: number;
}

export const ascensionCostSchema = z.object({
  coinCost: z.int().nonnegative(),
  costItems: z.array(itemCountSchema),
  requiredPlayerLevel: z.int().nonnegative(),
}) satisfies z.ZodType<AscensionCost>;
