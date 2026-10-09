import type { Inventory } from "#src/models/inventory/Inventory";
import type { ItemCount } from "#src/models/inventory/ItemCount";
import type { Wallet } from "#src/models/inventory/Wallet";
import type { OfferingLevel } from "#src/models/offering/OfferingLevel";
import type { OfferingOffer } from "#src/models/offering/OfferingOffer";
import type { OfferingProgress } from "#src/models/offering/OfferingProgress";
import type { GameText } from "genshin-text";

import { pickUpDroppedItem } from "#src/services/interaction/pickUpDroppedItem";
import { countInventoryItem } from "#src/services/inventory/countInventoryItem";
import { takeItemCounts } from "#src/services/inventory/takeItemCounts";
import { offerItems } from "#src/services/offering/offerItems";

// Offers every offering item the bag holds at once: each item the levels take is taken out of the bag and counted into
// The offering, which reaches the levels it now covers. The rewards of those levels are paid in as a pick up pays them,
// What the bag has no room for left over
export const offerBagItems = (
  { items, nextId }: Inventory,
  wallet: Wallet,
  progress: OfferingProgress<OfferingLevel>,
  gameText: GameText,
): OfferingOffer => {
  const offeringItemIds = new Set(progress.levels.filter(({ itemCount }) => itemCount > 0).map(({ itemId }) => itemId));
  const itemCounts: ItemCount[] = Array.from(offeringItemIds, (id) => ({ count: countInventoryItem(items, id), id }));
  const offeredCount = itemCounts.reduce((total, { count }) => total + count, 0);
  const { gainedLevels, progress: offeredProgress } = offerItems(progress, offeredCount);
  let inventory: Inventory = { items: takeItemCounts(items, itemCounts, 1), nextId };
  let paidWallet = wallet;
  let overflow = 0;
  for (const { itemCount, itemId } of gainedLevels.flatMap(({ rewards }) => rewards)) {
    const pickUp = pickUpDroppedItem({ count: itemCount, itemId }, inventory, paidWallet, gameText);
    inventory = pickUp.inventory;
    paidWallet = pickUp.wallet;
    overflow += pickUp.overflow;
  }
  return { inventory, overflow, progress: offeredProgress, wallet: paidWallet };
};
