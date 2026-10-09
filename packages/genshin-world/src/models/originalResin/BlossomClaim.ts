import type { Inventory } from "#src/models/inventory/Inventory";
import type { Wallet } from "#src/models/inventory/Wallet";

// A claim at a blossom's result: the Adventure EXP after it, and the bag and the wallet with the claim's resin or
// Condensed Resin spent and its rewards taken in
export interface BlossomClaim {
  adventureExp: number;
  inventory: Inventory;
  wallet: Wallet;
}
