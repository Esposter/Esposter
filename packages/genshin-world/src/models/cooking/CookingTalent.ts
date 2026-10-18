import type { CookingFoodType } from "#src/models/cooking/CookingFoodType";
import type { CookingTalentEffect } from "#src/models/cooking/CookingTalentEffect";

import { cookingFoodTypeSchema } from "#src/models/cooking/CookingFoodType";
import { cookingTalentEffectSchema } from "#src/models/cooking/CookingTalentEffect";
import { z } from "zod";

// A character's cooking talent, a utility passive unlocked from the start: the chance in percent its draw succeeds, the
// Effect it adds a dish with, and the kinds of dish it applies to
export interface CookingTalent {
  chance: number;
  effect: CookingTalentEffect;
  foodTypes: CookingFoodType[];
}

export const cookingTalentSchema = z.object({
  chance: z.int().min(0).max(100),
  effect: cookingTalentEffectSchema,
  foodTypes: z.array(cookingFoodTypeSchema).min(1),
}) satisfies z.ZodType<CookingTalent>;
