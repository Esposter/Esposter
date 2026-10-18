import type { CookingProgress } from "#src/models/cooking/CookingProgress";
import type { Inventory } from "#src/models/inventory/Inventory";
import type { Wallet } from "#src/models/inventory/Wallet";

// What an entry's use leaves: the bag with the entry used, the wallet where its use changed it, and the cooking progress where
// It taught a dish. A food changes only the bag, so its wallet is left out
export interface InventoryEntryUse {
  cookingProgress?: CookingProgress;
  inventory: Inventory;
  wallet?: Wallet;
}
