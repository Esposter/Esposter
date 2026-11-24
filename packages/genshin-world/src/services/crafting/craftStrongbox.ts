import type { CraftingStrongboxData } from "#src/models/crafting/CraftingStrongboxData";
import type { StrongboxCraftTables } from "#src/models/crafting/StrongboxCraftTables";
import type { DroppedItemPickUp } from "#src/models/interaction/DroppedItemPickUp";
import type { Inventory } from "#src/models/inventory/Inventory";
import type { ItemCategoryRoomMap } from "#src/models/inventory/ItemCategoryRoomMap";
import type { Wallet } from "#src/models/inventory/Wallet";

import { checkIsOfferableForStrongbox } from "#src/services/crafting/checkIsOfferableForStrongbox";
import { rollStrongboxArtifact } from "#src/services/crafting/rollStrongboxArtifact";
import { pickUpDroppedItem } from "#src/services/interaction/pickUpDroppedItem";

// The bag and wallet after the Mystic Offering makes a strongbox: the chosen artifacts are given up, which must be
// Exactly the strongbox's count of different unlocked artifacts of its star rank, and the artifact it holds is taken in
// As a drop. Undefined for any other choice, which gives up nothing
export const craftStrongbox = (
  inventory: Inventory,
  wallet: Wallet,
  strongbox: CraftingStrongboxData,
  pickedIds: number[],
  tables: StrongboxCraftTables,
  itemRooms: ItemCategoryRoomMap,
): DroppedItemPickUp | undefined => {
  const isCountRight = pickedIds.length === strongbox.needCount && new Set(pickedIds).size === pickedIds.length;
  const isOfferable = pickedIds.every((id) =>
    checkIsOfferableForStrongbox(
      inventory.items.find((item) => item.id === id),
      strongbox.rarity,
    ),
  );
  if (!isCountRight || !isOfferable) return undefined;
  const { artifactDropTables, materialDataMap, names, random, reliquaryPieceEntryMap, weaponDataMap } = tables;
  const remaining: Inventory = { ...inventory, items: inventory.items.filter((item) => !pickedIds.includes(item.id)) };
  return pickUpDroppedItem(
    rollStrongboxArtifact(strongbox, random, artifactDropTables),
    remaining,
    wallet,
    names,
    materialDataMap,
    itemRooms,
    reliquaryPieceEntryMap,
    weaponDataMap,
  );
};
