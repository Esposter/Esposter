import type { CookingQuality } from "#src/models/cooking/CookingQuality";
import type { CookingRecipe } from "#src/models/cooking/CookingRecipe";
import type { CookingTalent } from "#src/models/cooking/CookingTalent";

import { PERCENT_TOTAL } from "#src/services/cooking/constants";
import { CookingTalentQualityMap } from "#src/services/cooking/CookingTalentQualityMap";

// How many more of a dish one cooking talent adds: a roll is drawn from `random` for every dish the talent's cook makes,
// And it is one more where the dish's quality and kind are the talent's and the roll falls under its chance, else none
export const rollCookingTalentExtra = (
  talent: CookingTalent | undefined,
  recipe: CookingRecipe,
  quality: CookingQuality,
  random: () => number,
): number => {
  if (talent === undefined) return 0;
  const roll = random();
  const isTriggered = talent.foodTypes.includes(recipe.foodType) && quality === CookingTalentQualityMap[talent.effect];
  return isTriggered && roll < talent.chance / PERCENT_TOTAL ? 1 : 0;
};
