import type { Inventory } from "#src/models/inventory/Inventory";
import type { ItemCount } from "#src/models/inventory/ItemCount";
import type { MaterialData } from "#src/models/inventory/MaterialData";
import type { Wallet } from "#src/models/inventory/Wallet";
import type { OfferingLevel } from "#src/models/offering/OfferingLevel";
import type { OfferingOffer } from "#src/models/offering/OfferingOffer";
import type { OfferingProgress } from "#src/models/offering/OfferingProgress";

import { countInventoryItem } from "#src/services/inventory/countInventoryItem";
import { takeItemCounts } from "#src/services/inventory/takeItemCounts";
import { offerItems } from "#src/services/offering/offerItems";
import { payOfferingLevels } from "#src/services/offering/payOfferingLevels";

// Offers every offering item the bag holds at once: each item the levels take is taken out of the bag and counted into
// The offering, which reaches the levels it now covers, and those levels' rewards are paid as payOfferingLevels pays them
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
  const paid = payOfferingLevels(
    gainedLevels,
    { items: takeItemCounts(items, itemCounts, 1), nextId },
    wallet,
    names,
    materialDataMap,
  );
  return { ...paid, progress: offeredProgress };
};
