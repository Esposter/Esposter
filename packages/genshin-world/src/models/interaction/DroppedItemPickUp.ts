import type { Inventory } from "#src/models/inventory/Inventory";
import type { Wallet } from "#src/models/inventory/Wallet";

// What a pick up leaves: the bag and the wallet after taking it in, and how many of the drop there was no room for
export interface DroppedItemPickUp {
  inventory: Inventory;
  overflow: number;
  wallet: Wallet;
}
