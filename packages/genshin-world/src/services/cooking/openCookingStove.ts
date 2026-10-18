import type { CookingRecipe } from "#src/models/cooking/CookingRecipe";

// The recipe the cooking screen opens on when a city's stove is used: the first one the cook knows from the start. The
// Stove cooks whether or not a campfire is lit, so it takes no fire. Provisional, since the game's list lets the cook
// Choose the recipe and that list is not built. Undefined where no recipe is known from the start, and the screen stays shut
export const openCookingStove = (recipes: readonly CookingRecipe[]): CookingRecipe | undefined =>
  recipes.find(({ isDefaultUnlocked }) => isDefaultUnlocked);
