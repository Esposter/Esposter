import type { Inventory } from "#src/models/inventory/Inventory";
import type { InventoryDestruction } from "#src/models/inventory/InventoryDestruction";
import type { MaterialData } from "#src/models/inventory/MaterialData";
import type { Wallet } from "#src/models/inventory/Wallet";

import { addRewardItem } from "#src/services/inventory/addRewardItem";
import { getDestroyableItem } from "#src/services/inventory/getDestroyableItem";
import { getDestroyReturns } from "#src/services/inventory/getDestroyReturns";

// The bag and the wallet after every chosen entry is destroyed: each entry must be one the bag may destroy, or the whole
// Destruction is refused, and what the destroyed entries return is taken into the wallet or the bag. Undefined where the
// Bag cannot take every returned material whole, which refuses the destruction as a whole, nothing destroyed. An id chosen
// Twice is destroyed once, so its return is taken in once
export const destroyInventoryItems = (
  inventory: Inventory,
  wallet: Wallet,
  ids: number[],
  names: Readonly<Record<string, string>>,
  materialDataMap: ReadonlyMap<number, MaterialData>,
): InventoryDestruction | undefined => {
  const { items } = inventory;
  const destroyedItems = Array.from(new Set(ids), (id) => getDestroyableItem(items, id));
  const remainingInventory: Inventory = { ...inventory, items: items.filter((item) => !destroyedItems.includes(item)) };
  return getDestroyReturns(destroyedItems).reduce<InventoryDestruction | undefined>(
    (destruction, itemCount) => destruction && addRewardItem(destruction, itemCount, names, materialDataMap),
    { inventory: remainingInventory, wallet },
  );
};
