import type { CraftingRecipe } from "#src/models/crafting/CraftingRecipe";
import type { CraftingStrongboxData } from "#src/models/crafting/CraftingStrongboxData";
import type { HomeBlueprint } from "#src/models/home/HomeBlueprint";
import type { PaimonsBargainsRotation } from "#src/models/shop/PaimonsBargainsRotation";
import type { ShopGood } from "#src/models/shop/ShopGood";
import type { WishScheduleEvent } from "#src/models/wish/WishScheduleEvent";

// The records a screen open over the world reads, each read the first time its screen opens and held after, so the
// World's first frame reads none of them
export interface ScreenRecords {
  // The bench's recipes in the game's order, which the crafting screen offers the learned ones of
  craftingRecipes: CraftingRecipe[];
  // The Mystic Offering's strongboxes, one for each set the offering may choose, which the bench offers from its Adventure Rank
  craftingStrongboxes: CraftingStrongboxData[];
  // The Serenitea Pot's furnishings Tubby makes, each with the diagrams that open it, which a diagram's Use learns it from
  homeBlueprints: HomeBlueprint[];
  // Each city vendor's shop's goods, by the shop's id, which a vendor's talk opens the shop of
  shopIdShopGoodMap: ReadonlyMap<number, ShopGood[]>;
  // The characters and weapons Paimon's Bargains offers in turn, which its screen reads each month's pair and set from
  paimonsBargainsRotation: PaimonsBargainsRotation;
  // The wish schedule's event banners, each offered by the wish screen only inside its window
  wishSchedule: WishScheduleEvent[];
}
