import type { Inventory } from "#src/models/inventory/Inventory";
import type { Wallet } from "#src/models/inventory/Wallet";

// What a Fragile Resin's use leaves: the bag with one taken out, and the wallet with its Original Resin restored
export interface FragileResinUse {
  inventory: Inventory;
  wallet: Wallet;
}
