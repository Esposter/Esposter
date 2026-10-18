import type { Inventory } from "#src/models/inventory/Inventory";
import type { Wallet } from "#src/models/inventory/Wallet";

// The claim of a trial stage's first clear: the stages claimed so far, and the bag and the wallet with the reward paid into them
export interface TrialStageClaim {
  claimedStageIds: ReadonlySet<number>;
  inventory: Inventory;
  wallet: Wallet;
}
