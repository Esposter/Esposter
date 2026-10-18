import type { DroppedItem } from "#src/models/enemy/DroppedItem";
import type { DroppedItemPickUp } from "#src/models/interaction/DroppedItemPickUp";
import type { Inventory } from "#src/models/inventory/Inventory";
import type { MaterialData } from "#src/models/inventory/MaterialData";
import type { Wallet } from "#src/models/inventory/Wallet";
import type { ReliquaryPieceEntry } from "#src/models/reliquary/ReliquaryPieceEntry";

import { addDroppedItem } from "#src/services/inventory/addDroppedItem";
import { getDroppedItemDefinition } from "#src/services/inventory/getDroppedItemDefinition";
import { getWalletCurrency } from "#src/services/inventory/getWalletCurrency";

// What a pick up takes: a currency into the wallet by the currency its item is filed under, since the wallet has no room
// To run out of, and any other item into the bag as its definition has it, the bag's room deciding how much of it goes
// In. An artifact is taken in as the artifact it was rolled as, and what the bag has no room for is left over. Only an
// Artifact drop needs the reliquary tables, so a caller whose items are never artifacts leaves them out
export const pickUpDroppedItem = (
  dropped: DroppedItem,
  inventory: Inventory,
  wallet: Wallet,
  names: Readonly<Record<string, string>>,
  materialDataMap: ReadonlyMap<number, MaterialData>,
  reliquaryPieceEntryMap: ReadonlyMap<number, ReliquaryPieceEntry> = new Map(),
): DroppedItemPickUp => {
  const { count, itemId } = dropped;
  const currency = getWalletCurrency(itemId);
  if (currency !== undefined)
    return { inventory, overflow: 0, wallet: { ...wallet, [currency]: wallet[currency] + count } };
  const definition = getDroppedItemDefinition(itemId, names, materialDataMap, reliquaryPieceEntryMap);
  return { ...addDroppedItem(inventory, dropped, definition), wallet };
};
