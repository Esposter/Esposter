import type { Inventory } from "#src/models/inventory/Inventory";
import type { Wallet } from "#src/models/inventory/Wallet";

// What an entry's use leaves: the bag with the entry used, and the wallet where its use changed it. A food changes only
// The bag, so its wallet is left out
export interface InventoryEntryUse {
  inventory: Inventory;
  wallet?: Wallet;
}
