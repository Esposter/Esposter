import type { DroppedItem } from "#src/models/enemy/DroppedItem";
import type { DroppedItemPickUp } from "#src/models/interaction/DroppedItemPickUp";
import type { Inventory } from "#src/models/inventory/Inventory";
import type { Wallet } from "#src/models/inventory/Wallet";

import { Currency } from "#src/models/inventory/Currency";
import { addInventoryItem } from "#src/services/inventory/addInventoryItem";
import { MORA_ITEM_ID } from "#src/services/inventory/constants";
import { getItemDefinition } from "#src/services/inventory/getItemDefinition";

// What a pick up takes: Mora into the wallet, which has no room to run out of, and any other item into the bag as its
// Definition has it, the bag's room deciding how much of it goes in. What the bag has no room for is left over
export const pickUpDroppedItem = (
  { count, itemId }: DroppedItem,
  inventory: Inventory,
  wallet: Wallet,
  names: Readonly<Record<string, string>>,
): DroppedItemPickUp => {
  if (itemId === MORA_ITEM_ID)
    return { inventory, overflow: 0, wallet: { ...wallet, [Currency.Mora]: wallet[Currency.Mora] + count } };
  const definition = getItemDefinition(itemId, names);
  return { ...addInventoryItem(inventory, definition, count), wallet };
};
