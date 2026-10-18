import type { Inventory } from "#src/models/inventory/Inventory";
import type { ItemCount } from "#src/models/inventory/ItemCount";
import type { MaterialData } from "#src/models/inventory/MaterialData";
import type { Wallet } from "#src/models/inventory/Wallet";

import { Currency } from "#src/models/inventory/Currency";
import { ADVENTURE_EXP_ITEM_ID } from "#src/services/forging/constants";
import { addInventoryItem } from "#src/services/inventory/addInventoryItem";
import { MORA_ITEM_ID } from "#src/services/inventory/constants";
import { getItemDefinition } from "#src/services/inventory/getItemDefinition";
import { COMPANIONSHIP_EXP_ITEM_ID } from "#src/services/originalResin/constants";

// Grants a reward's items: the Mora in the list goes into the wallet, the Adventure and Companionship EXP items are left
// Out, since the EXP is paid to the Adventure Rank by its own route, and the rest goes into the bag. Undefined where the
// Bag cannot take an item whole, so nothing is granted
export const grantRewardItems = (
  wallet: Wallet,
  inventory: Inventory,
  rewards: ItemCount[],
  names: Readonly<Record<string, string>>,
  materialDataMap: ReadonlyMap<number, MaterialData>,
): undefined | { inventory: Inventory; wallet: Wallet } => {
  let grantedInventory = inventory;
  let moraCount = 0;
  for (const { count, id } of rewards)
    if (id === MORA_ITEM_ID) moraCount += count;
    else if (id !== ADVENTURE_EXP_ITEM_ID && id !== COMPANIONSHIP_EXP_ITEM_ID) {
      const addition = addInventoryItem(grantedInventory, getItemDefinition(id, names, materialDataMap), count);
      if (addition.overflow > 0) return undefined;
      grantedInventory = addition.inventory;
    }
  return { inventory: grantedInventory, wallet: { ...wallet, [Currency.Mora]: wallet[Currency.Mora] + moraCount } };
};
