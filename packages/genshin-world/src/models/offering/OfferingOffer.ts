import type { DroppedItem } from "#src/models/enemy/DroppedItem";
import type { Inventory } from "#src/models/inventory/Inventory";
import type { Wallet } from "#src/models/inventory/Wallet";
import type { OfferingLevel } from "#src/models/offering/OfferingLevel";
import type { OfferingProgress } from "#src/models/offering/OfferingProgress";

// What an offer leaves: the Adventure EXP the levels reached pay, which the Adventure Rank gains, the bag and the wallet
// After the offering items are taken out and the levels' other rewards are paid in, the offering's progress, and the
// Rewards the bag had no room for, each with the count left over
export interface OfferingOffer {
  adventureExp: number;
  inventory: Inventory;
  overflowItems: DroppedItem[];
  progress: OfferingProgress<OfferingLevel>;
  wallet: Wallet;
}
