import type { ForgeRecipe } from "#src/models/forging/ForgeRecipe";

import { MAGICAL_CRYSTAL_CHUNK_ITEM_ID } from "#src/services/forging/constants";

// Whether the Serenitea Pot's forge refuses a recipe: it takes no Magical Crystal Chunk, so a recipe that takes one is refused
// There, and is forged anywhere else
export const checkIsForgeRecipeRefusedInRealm = (recipe: ForgeRecipe): boolean =>
  recipe.materials.some(({ id }) => id === MAGICAL_CRYSTAL_CHUNK_ITEM_ID);
