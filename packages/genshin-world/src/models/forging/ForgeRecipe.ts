import type { ForgeResult } from "#src/models/forging/ForgeResult";
import type { ItemCount } from "#src/models/inventory/ItemCount";

import { ForgeRecipeKind } from "#src/models/forging/ForgeRecipeKind";
import { forgeResultSchema } from "#src/models/forging/ForgeResult";
import { itemCountSchema } from "#src/models/inventory/ItemCount";
import { z } from "zod";

// One recipe as the game's forge table holds it: its kind and the game's forge type, the materials it takes, the Mora it
// Costs, the seconds one item takes, the most one queue holds, the Adventure Rank it needs, the forge points one item counts
// Toward the day's cap, and what one item yields. The instruction items that open it are listed, none where it is open
// From the start
export interface ForgeRecipe {
  forgePoint: number;
  forgeType: number;
  id: number;
  kind: ForgeRecipeKind;
  materials: ItemCount[];
  mora: number;
  playerLevel: number;
  queueSize: number;
  results: ForgeResult[];
  seconds: number;
  unlockItemIds: number[];
}

export const forgeRecipeSchema = z.object({
  forgePoint: z.int().nonnegative(),
  forgeType: z.int().positive(),
  id: z.int().positive(),
  kind: z.enum(ForgeRecipeKind),
  materials: z.array(itemCountSchema).min(1),
  mora: z.int().nonnegative(),
  playerLevel: z.int().nonnegative(),
  queueSize: z.int().positive(),
  results: z.array(forgeResultSchema).min(1),
  seconds: z.int().positive(),
  unlockItemIds: z.array(z.int().positive()),
}) satisfies z.ZodType<ForgeRecipe>;
