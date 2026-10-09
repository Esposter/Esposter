import type { ItemCount } from "#src/models/inventory/ItemCount";

import { ForgeRecipeKind } from "#src/models/forging/ForgeRecipeKind";
import { itemCountSchema } from "#src/models/inventory/ItemCount";
import { z } from "zod";

// One recipe as the game's forge table holds it: its kind, the materials it takes, the Mora it costs, the seconds one item
// Takes, the most one queue holds, the Adventure Rank it needs, the forge points one item counts toward the day's cap, and
// The item and count it makes. The instruction items that open it are listed, none where it is open from the start
export interface ForgeRecipe {
  forgePoint: number;
  id: number;
  kind: ForgeRecipeKind;
  materials: ItemCount[];
  mora: number;
  playerLevel: number;
  queueSize: number;
  resultCount: number;
  resultItemId: number;
  seconds: number;
  unlockItemIds: number[];
}

export const forgeRecipeSchema = z.object({
  forgePoint: z.int().nonnegative(),
  id: z.int().positive(),
  kind: z.enum(ForgeRecipeKind),
  materials: z.array(itemCountSchema).min(1),
  mora: z.int().nonnegative(),
  playerLevel: z.int().nonnegative(),
  queueSize: z.int().positive(),
  resultCount: z.int().positive(),
  resultItemId: z.int().positive(),
  seconds: z.int().positive(),
  unlockItemIds: z.array(z.int().positive()),
}) satisfies z.ZodType<ForgeRecipe>;
