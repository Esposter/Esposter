import type { ItemCount } from "#src/models/inventory/ItemCount";

import { itemCountSchema } from "#src/models/inventory/ItemCount";
import { z } from "zod";

// One processing as the game's compound table holds it: the ingredients it takes, the one item and count it makes, the
// Seconds one unit takes, how many units may be queued at once, the rank it is open at, and whether it is open from the
// Start
export interface ProcessingRecipe {
  costTime: number;
  id: number;
  ingredients: ItemCount[];
  isDefaultUnlocked: boolean;
  queueSize: number;
  rankLevel: number;
  result: ItemCount;
}

export const processingRecipeSchema = z.object({
  costTime: z.int().positive(),
  id: z.int().positive(),
  ingredients: z.array(itemCountSchema).min(1),
  isDefaultUnlocked: z.boolean(),
  queueSize: z.int().positive(),
  rankLevel: z.int().positive(),
  result: itemCountSchema,
}) satisfies z.ZodType<ProcessingRecipe>;
