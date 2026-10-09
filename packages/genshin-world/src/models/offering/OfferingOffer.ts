import type { Inventory } from "#src/models/inventory/Inventory";
import type { Wallet } from "#src/models/inventory/Wallet";
import type { OfferingLevel } from "#src/models/offering/OfferingLevel";
import type { OfferingProgress } from "#src/models/offering/OfferingProgress";

// What an offer leaves: the bag and the wallet after the offering items are taken out and the rewards of the levels
// Reached are paid in, the offering's progress, and how many rewarded items there was no room for
export interface OfferingOffer {
  inventory: Inventory;
  overflow: number;
  progress: OfferingProgress<OfferingLevel>;
  wallet: Wallet;
}
