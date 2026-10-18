import type { DroppedItem } from "#src/models/enemy/DroppedItem";
import type { Inventory } from "#src/models/inventory/Inventory";
import type { MaterialData } from "#src/models/inventory/MaterialData";
import type { Wallet } from "#src/models/inventory/Wallet";
import type { RewardClaim } from "#src/models/reward/RewardClaim";

import { pickUpDroppedItem } from "#src/services/interaction/pickUpDroppedItem";
import { InvalidOperationError, Operation } from "@esposter/shared";

// The bag and the wallet after the items of the given rewards are claimed, each item given as a pick up gives it: wallet
// Currencies into the wallet and the rest into the bag. Undefined where an item has no room left in the bag, since a claim
// Is refused whole and neither the bag nor the wallet changes
export const claimRewards = (
  givenRewardIds: readonly number[],
  rewardItems: Readonly<Record<string, DroppedItem[]>>,
  inventory: Inventory,
  wallet: Wallet,
  names: Readonly<Record<string, string>>,
  materialDataMap: ReadonlyMap<number, MaterialData>,
): RewardClaim | undefined => {
  let claimedInventory = inventory;
  let claimedWallet = wallet;
  for (const rewardId of givenRewardIds) {
    const items = rewardItems[String(rewardId)];
    if (!items)
      throw new InvalidOperationError(Operation.Read, String(rewardId), "names no items in the rewards record");
    for (const item of items) {
      const pickUp = pickUpDroppedItem(item, claimedInventory, claimedWallet, names, materialDataMap);
      if (pickUp.overflow > 0) return undefined;
      claimedInventory = pickUp.inventory;
      claimedWallet = pickUp.wallet;
    }
  }
  return { inventory: claimedInventory, wallet: claimedWallet };
};
