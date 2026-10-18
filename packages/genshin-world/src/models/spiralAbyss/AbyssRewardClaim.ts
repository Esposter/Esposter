import type { Inventory } from "#src/models/inventory/Inventory";
import type { Wallet } from "#src/models/inventory/Wallet";

// The state after a clear's rewards are claimed: the bag and the wallet with every item of the rewards taken in
export interface AbyssRewardClaim {
  inventory: Inventory;
  wallet: Wallet;
}
