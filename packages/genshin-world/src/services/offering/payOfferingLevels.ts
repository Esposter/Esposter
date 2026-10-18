import type { DroppedItem } from "#src/models/enemy/DroppedItem";
import type { Inventory } from "#src/models/inventory/Inventory";
import type { MaterialData } from "#src/models/inventory/MaterialData";
import type { Wallet } from "#src/models/inventory/Wallet";
import type { OfferingLevel } from "#src/models/offering/OfferingLevel";

import { ADVENTURE_EXP_ITEM_ID } from "#src/services/forging/constants";
import { pickUpDroppedItem } from "#src/services/interaction/pickUpDroppedItem";

// Pays the rewards of the levels an offering reaches, in order: the Adventure EXP they give is returned for the Adventure
// Rank to gain, as a forge order returns its own, and every other reward is paid in as a pick up pays it, what the bag
// Has no room for returned to be dropped
export const payOfferingLevels = (
  gainedLevels: OfferingLevel[],
  inventory: Inventory,
  wallet: Wallet,
  names: Readonly<Record<string, string>>,
  materialDataMap: ReadonlyMap<number, MaterialData>,
): { adventureExp: number; inventory: Inventory; overflowItems: DroppedItem[]; wallet: Wallet } => {
  let adventureExp = 0;
  let paidInventory = inventory;
  let paidWallet = wallet;
  const overflowItems: DroppedItem[] = [];
  for (const { itemCount, itemId } of gainedLevels.flatMap(({ rewards }) => rewards))
    if (itemId === ADVENTURE_EXP_ITEM_ID) adventureExp += itemCount;
    else {
      const pickUp = pickUpDroppedItem({ count: itemCount, itemId }, paidInventory, paidWallet, names, materialDataMap);
      paidInventory = pickUp.inventory;
      paidWallet = pickUp.wallet;
      if (pickUp.overflow > 0) overflowItems.push({ count: pickUp.overflow, itemId });
    }
  return { adventureExp, inventory: paidInventory, overflowItems, wallet: paidWallet };
};
