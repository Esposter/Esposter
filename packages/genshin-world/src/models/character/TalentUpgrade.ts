import type { ItemCount } from "#src/models/inventory/ItemCount";

import { itemCountSchema } from "#src/models/inventory/ItemCount";
import { z } from "zod";

// A combat talent's step up to one level: the ascension phase that level needs, the Mora it costs, and the items of
// The talent materials and the weekly bosses' drops it takes from the bag
export interface TalentUpgrade {
  coinCost: number;
  costItems: ItemCount[];
  level: number;
  phase: number;
}

export const talentUpgradeSchema = z.object({
  coinCost: z.int().nonnegative(),
  costItems: z.array(itemCountSchema),
  level: z.int().positive(),
  phase: z.int().nonnegative(),
}) satisfies z.ZodType<TalentUpgrade>;
