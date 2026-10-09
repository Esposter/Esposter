import type { Inventory } from "#src/models/inventory/Inventory";
import type { Wallet } from "#src/models/inventory/Wallet";

// The bag and the wallet after a destroy: the entries destroyed are gone, and what each returned is in the bag or the wallet
export interface InventoryDestruction {
  inventory: Inventory;
  wallet: Wallet;
}
