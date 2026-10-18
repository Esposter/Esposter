import type { Inventory } from "#src/models/inventory/Inventory";
import type { Wallet } from "#src/models/inventory/Wallet";

// The state after a claim's rewards are claimed: the bag and the wallet with every item of the rewards taken in
export interface RewardClaim {
  inventory: Inventory;
  wallet: Wallet;
}
