import type { Inventory } from "#src/models/inventory/Inventory";
import type { ItemCount } from "#src/models/inventory/ItemCount";
import type { MaterialData } from "#src/models/inventory/MaterialData";
import type { Wallet } from "#src/models/inventory/Wallet";
import type { OfferingLevel } from "#src/models/offering/OfferingLevel";
import type { OfferingOffer } from "#src/models/offering/OfferingOffer";
import type { OfferingProgress } from "#src/models/offering/OfferingProgress";

import { ADVENTURE_EXP_ITEM_ID } from "#src/services/forging/constants";
import { pickUpDroppedItem } from "#src/services/interaction/pickUpDroppedItem";
import { countInventoryItem } from "#src/services/inventory/countInventoryItem";
import { takeItemCounts } from "#src/services/inventory/takeItemCounts";
import { offerItems } from "#src/services/offering/offerItems";

// Offers every offering item the bag holds at once: each item the levels take is taken out of the bag and counted into
// The offering, which reaches the levels it now covers. The Adventure EXP of those levels is returned for the Adventure
// Rank to gain, as a forge order returns its own, and every other reward is paid in as a pick up pays it, what the bag
// Has no room for left over
export const offerBagItems = (
  { items, nextId }: Inventory,
  wallet: Wallet,
  progress: OfferingProgress<OfferingLevel>,
  names: Readonly<Record<string, string>>,
  materialDataMap: ReadonlyMap<number, MaterialData>,
): OfferingOffer => {
  const offeringItemIds = new Set(progress.levels.filter(({ itemCount }) => itemCount > 0).map(({ itemId }) => itemId));
  const itemCounts: ItemCount[] = Array.from(offeringItemIds, (id) => ({ count: countInventoryItem(items, id), id }));
  const offeredCount = itemCounts.reduce((total, { count }) => total + count, 0);
  const { gainedLevels, progress: offeredProgress } = offerItems(progress, offeredCount);
  let adventureExp = 0;
  let inventory: Inventory = { items: takeItemCounts(items, itemCounts, 1), nextId };
  let paidWallet = wallet;
  let overflow = 0;
  for (const { itemCount, itemId } of gainedLevels.flatMap(({ rewards }) => rewards))
    if (itemId === ADVENTURE_EXP_ITEM_ID) adventureExp += itemCount;
    else {
      const pickUp = pickUpDroppedItem({ count: itemCount, itemId }, inventory, paidWallet, names, materialDataMap);
      inventory = pickUp.inventory;
      paidWallet = pickUp.wallet;
      overflow += pickUp.overflow;
    }
  return { adventureExp, inventory, overflow, progress: offeredProgress, wallet: paidWallet };
};
