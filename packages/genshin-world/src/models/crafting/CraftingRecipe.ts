import type { ItemCount } from "#src/models/inventory/ItemCount";

import { CraftingRecipeKind } from "#src/models/crafting/CraftingRecipeKind";
import { itemCountSchema } from "#src/models/inventory/ItemCount";
import { z } from "zod";

// One recipe as the game's combine table holds it: its kind, the materials it takes, the Mora it costs, the Adventure
// Rank it needs, and the item and count it makes. The instruction items that open it are listed, none where it is open
// From the start
export interface CraftingRecipe {
  id: number;
  kind: CraftingRecipeKind;
  materials: ItemCount[];
  mora: number;
  playerLevel: number;
  resultCount: number;
  resultItemId: number;
  unlockItemIds: number[];
}

export const craftingRecipeSchema = z.object({
  id: z.int().positive(),
  kind: z.enum(CraftingRecipeKind),
  materials: z.array(itemCountSchema).min(1),
  mora: z.int().nonnegative(),
  playerLevel: z.int().nonnegative(),
  resultCount: z.int().positive(),
  resultItemId: z.int().positive(),
  unlockItemIds: z.array(z.int().positive()),
}) satisfies z.ZodType<CraftingRecipe>;
