import type { CookingQuality } from "#src/models/cooking/CookingQuality";
import type { CookingRecipe } from "#src/models/cooking/CookingRecipe";

import { PERCENT_TOTAL } from "#src/services/cooking/constants";

// The item a dish cooked at a quality makes: the character's special dish in place of it where the character names one
// And the roll, a number from zero up to one, falls under the chance its row gives for that quality, or its own result
export const pickDishItemId = (
  recipe: CookingRecipe,
  quality: CookingQuality,
  avatarId: number,
  roll: number,
): number => {
  const specialty = recipe.specialties.find((candidate) => candidate.avatarId === avatarId);
  if (specialty && roll < specialty.chances[quality] / PERCENT_TOTAL) return specialty.itemId;
  return recipe.resultItemIds[quality];
};
