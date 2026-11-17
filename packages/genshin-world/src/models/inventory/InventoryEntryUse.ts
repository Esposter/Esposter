import type { CookingProgress } from "#src/models/cooking/CookingProgress";
import type { CraftingProgress } from "#src/models/crafting/CraftingProgress";
import type { ForgeProgress } from "#src/models/forging/ForgeProgress";
import type { HomeProgress } from "#src/models/home/HomeProgress";
import type { Inventory } from "#src/models/inventory/Inventory";
import type { Wallet } from "#src/models/inventory/Wallet";

// What an entry's use leaves: the bag with the entry used, the wallet where its use changed it, and the progress where it
// Taught a dish, a crafting recipe, a forge recipe or a blueprint. A food changes only the bag, so its wallet is left out
export interface InventoryEntryUse {
  cookingProgress?: CookingProgress;
  craftingProgress?: CraftingProgress;
  forgeProgress?: ForgeProgress;
  homeProgress?: HomeProgress;
  inventory: Inventory;
  wallet?: Wallet;
}
