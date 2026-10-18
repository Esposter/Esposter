import type { CookingFoodType } from "#src/models/cooking/CookingFoodType";
import type { CookingSpecialty } from "#src/models/cooking/CookingSpecialty";
import type { ItemCount } from "#src/models/inventory/ItemCount";

import { cookingFoodTypeSchema } from "#src/models/cooking/CookingFoodType";
import { CookingQuality } from "#src/models/cooking/CookingQuality";
import { cookingSpecialtySchema } from "#src/models/cooking/CookingSpecialty";
import { itemCountSchema } from "#src/models/inventory/ItemCount";
import { z } from "zod";

// One dish as the game's cook recipe table holds it: the ingredients it takes, the kind of dish it is, the item each
// Quality of its result is, its maximum proficiency, the rarity it is by Adventure Rank, its zone parameters, its
// Specialties, and the instruction items that teach it, none where it is known from the start
export interface CookingRecipe {
  foodType: CookingFoodType;
  id: number;
  ingredients: ItemCount[];
  isDefaultUnlocked: boolean;
  maxProficiency: number;
  nameTextId: string;
  qteParam: [number, number];
  rankLevel: number;
  resultItemIds: Record<CookingQuality, number>;
  specialties: CookingSpecialty[];
  unlockItemIds: number[];
}

export const cookingRecipeSchema = z.object({
  foodType: cookingFoodTypeSchema,
  id: z.int().positive(),
  ingredients: z.array(itemCountSchema).min(1),
  isDefaultUnlocked: z.boolean(),
  maxProficiency: z.int().positive(),
  nameTextId: z.string().min(1),
  qteParam: z.tuple([z.number(), z.number()]),
  rankLevel: z.int().positive(),
  resultItemIds: z.record(z.enum(CookingQuality), z.int().positive()),
  specialties: z.array(cookingSpecialtySchema),
  unlockItemIds: z.array(z.int().positive()),
}) satisfies z.ZodType<CookingRecipe>;
