import type { DishBonus } from "#src/models/cooking/DishBonus";
import type { DishTarget } from "#src/models/cooking/DishTarget";

import { dishBonusSchema } from "#src/models/cooking/DishBonus";
import { dishTargetSchema } from "#src/models/cooking/DishTarget";
import { z } from "zod";

// A dish's use when it is eaten, as its item names it: the heal its buff gives, as a flat amount and a share of its
// Target's Max HP, the HP its revive buff restores to a fallen character, the bonus its buff gives, and who the use
// Reaches. A dish has a heal, a revive, a bonus, or any of them
export interface DishUse {
  bonus?: DishBonus;
  heal?: { flat: number; healthShare: number };
  revive?: { flat: number };
  target: DishTarget;
}

export const dishUseSchema = z.object({
  bonus: dishBonusSchema.optional(),
  heal: z.object({ flat: z.int().nonnegative(), healthShare: z.number().min(0).max(1) }).optional(),
  revive: z.object({ flat: z.int().positive() }).optional(),
  target: dishTargetSchema,
}) satisfies z.ZodType<DishUse>;
