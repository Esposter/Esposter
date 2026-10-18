import type { DroppedItem } from "#src/models/enemy/DroppedItem";
import type { DroppedItemPickUp } from "#src/models/interaction/DroppedItemPickUp";
import type { Inventory } from "#src/models/inventory/Inventory";
import type { MaterialData } from "#src/models/inventory/MaterialData";
import type { Wallet } from "#src/models/inventory/Wallet";
import type { ReliquaryPieceEntry } from "#src/models/reliquary/ReliquaryPieceEntry";

import { addInventoryItem } from "#src/services/inventory/addInventoryItem";
import { getDroppedItemDefinition } from "#src/services/inventory/getDroppedItemDefinition";
import { getWalletCurrency } from "#src/services/inventory/getWalletCurrency";

// What a pick up takes: a currency into the wallet by the currency its item is filed under, since the wallet has no room
// To run out of, and any other item into the bag as its definition has it, the bag's room deciding how much of it goes
// In. What the bag has no room for is left over. Only an artifact drop needs the reliquary tables, so a caller whose items
// Are never artifacts leaves them out
export const pickUpDroppedItem = (
  { count, itemId }: DroppedItem,
  inventory: Inventory,
  wallet: Wallet,
  names: Readonly<Record<string, string>>,
  materialDataMap: ReadonlyMap<number, MaterialData>,
  reliquaryPieceEntryMap: ReadonlyMap<number, ReliquaryPieceEntry> = new Map(),
): DroppedItemPickUp => {
  const currency = getWalletCurrency(itemId);
  if (currency !== undefined)
    return { inventory, overflow: 0, wallet: { ...wallet, [currency]: wallet[currency] + count } };
  const definition = getDroppedItemDefinition(itemId, names, materialDataMap, reliquaryPieceEntryMap);
  return { ...addInventoryItem(inventory, definition, count), wallet };
};
