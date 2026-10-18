import type { CookingProgress } from "#src/models/cooking/CookingProgress";
import type { CookingRecipe } from "#src/models/cooking/CookingRecipe";

import { checkCanCookWith } from "#src/services/cooking/checkCanCookWith";
import { checkIsCookingRecipeOpen } from "#src/services/cooking/checkIsCookingRecipeOpen";

// Whether Auto Cook is offered for a dish on the cooking screen: the dish is known, the character on the field may cook it,
// And its proficiency is full, since Auto Cook makes a batch of Delicious dishes only once it is
export const checkCanAutoCook = (recipe: CookingRecipe, progress: CookingProgress, avatarId: number): boolean =>
  checkIsCookingRecipeOpen(recipe, progress) &&
  checkCanCookWith(avatarId) &&
  (progress.proficiencies[recipe.id] ?? 0) >= recipe.maxProficiency;
