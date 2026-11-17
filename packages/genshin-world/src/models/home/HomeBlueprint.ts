import type { ItemCount } from "#src/models/inventory/ItemCount";

import { itemCountSchema } from "#src/models/inventory/ItemCount";
import { z } from "zod";

// One furnishing Tubby makes, keyed by the furnishing's item id: the materials one unit takes, the seconds it takes, the Trust
// EXP its first making gives, and the diagrams that open it. A blueprint no diagram opens is open from the start
export interface HomeBlueprint {
  id: number;
  materials: ItemCount[];
  seconds: number;
  trustExp: number;
  unlockItemIds: number[];
}

export const homeBlueprintSchema = z.object({
  id: z.int().positive(),
  materials: z.array(itemCountSchema).min(1),
  seconds: z.int().positive(),
  trustExp: z.int().nonnegative(),
  unlockItemIds: z.array(z.int().positive()),
}) satisfies z.ZodType<HomeBlueprint>;
