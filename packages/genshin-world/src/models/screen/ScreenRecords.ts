import type { CraftingRecipe } from "#src/models/crafting/CraftingRecipe";
import type { CraftingStrongboxData } from "#src/models/crafting/CraftingStrongboxData";
import type { HomeBlueprint } from "#src/models/home/HomeBlueprint";

// The records a screen open over the world reads, each read the first time its screen opens and held after, so the
// World's first frame reads none of them
export interface ScreenRecords {
  // The bench's recipes in the game's order, which the crafting screen offers the learned ones of
  craftingRecipes: CraftingRecipe[];
  // The Mystic Offering's strongboxes, one for each set the offering may choose, which the bench offers from its Adventure Rank
  craftingStrongboxes: CraftingStrongboxData[];
  // The Serenitea Pot's furnishings Tubby makes, each with the diagrams that open it, which a diagram's Use learns it from
  homeBlueprints: HomeBlueprint[];
}
