import type { DroppedItem } from "#src/models/enemy/DroppedItem";
import type { DroppedItemPickUp } from "#src/models/interaction/DroppedItemPickUp";
import type { Inventory } from "#src/models/inventory/Inventory";
import type { MaterialData } from "#src/models/inventory/MaterialData";
import type { Wallet } from "#src/models/inventory/Wallet";

import { addInventoryItem } from "#src/services/inventory/addInventoryItem";
import { getItemDefinition } from "#src/services/inventory/getItemDefinition";
import { getWalletCurrency } from "#src/services/inventory/getWalletCurrency";

// What a pick up takes: a currency into the wallet by the currency its item is filed under, since the wallet has no room
// To run out of, and any other item into the bag as its definition has it, the bag's room deciding how much of it goes
// In. What the bag has no room for is left over
export const pickUpDroppedItem = (
  { count, itemId }: DroppedItem,
  inventory: Inventory,
  wallet: Wallet,
  names: Readonly<Record<string, string>>,
  materialDataMap: ReadonlyMap<number, MaterialData>,
): DroppedItemPickUp => {
  const currency = getWalletCurrency(itemId);
  if (currency !== undefined)
    return { inventory, overflow: 0, wallet: { ...wallet, [currency]: wallet[currency] + count } };
  const definition = getItemDefinition(itemId, names, materialDataMap);
  return { ...addInventoryItem(inventory, definition, count), wallet };
};
