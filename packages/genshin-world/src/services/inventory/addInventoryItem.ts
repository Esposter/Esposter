import type { Inventory } from "#src/models/inventory/Inventory";
import type { InventoryAddition } from "#src/models/inventory/InventoryAddition";
import type { ItemDefinition } from "#src/models/inventory/ItemDefinition";

import { INVENTORY_KIND_LIMIT } from "#src/services/inventory/bagLimits";
import { ARTIFACT_START_LEVEL, EQUIPMENT_CATEGORIES, WEAPON_START_LEVEL } from "#src/services/inventory/constants";
import { countCategoryPieces } from "#src/services/inventory/countCategoryPieces";
import { ItemCategoryRoomMap } from "#src/services/inventory/ItemCategoryRoomMap";
import { ItemCategory } from "genshin-interface";

// The bag after taking in so many of an item, as the game takes a pick up. Each weapon or artifact is an entry of its
// Own at its starting level; anything else fills its stack up to the item's own limit, or opens a new one while the bag
// Holds fewer kinds than its limit. A tab counted on its own takes no more pieces than its room, and whatever does not
// Fit is left over
export const addInventoryItem = (
  { items, nextId }: Inventory,
  definition: ItemDefinition,
  quantity: number,
): InventoryAddition => {
  const categoryRoom = ItemCategoryRoomMap[definition.category];
  const tabRoom =
    categoryRoom === undefined ? Infinity : categoryRoom - countCategoryPieces(items, definition.category);
  if (EQUIPMENT_CATEGORIES.includes(definition.category)) {
    const addedCount = Math.max(Math.min(quantity, tabRoom), 0);
    const level = definition.category === ItemCategory.Weapon ? WEAPON_START_LEVEL : ARTIFACT_START_LEVEL;
    const addedItems = Array.from({ length: addedCount }, (_value, index) => ({
      definition,
      id: nextId + index,
      level,
      quantity: 1,
    }));
    return {
      inventory: { items: [...items, ...addedItems], nextId: nextId + addedCount },
      overflow: quantity - addedCount,
    };
  }

  const stack = items.find((item) => item.definition.id === definition.id);
  if (stack) {
    const addedCount = Math.max(Math.min(quantity, definition.stackLimit - stack.quantity, tabRoom), 0);
    return {
      inventory: {
        items: items.map((item) => (item === stack ? { ...item, quantity: item.quantity + addedCount } : item)),
        nextId,
      },
      overflow: quantity - addedCount,
    };
  }

  const kindCount = items.filter((item) => ItemCategoryRoomMap[item.definition.category] === undefined).length;
  const addedCount =
    categoryRoom === undefined && kindCount >= INVENTORY_KIND_LIMIT
      ? 0
      : Math.max(Math.min(quantity, definition.stackLimit, tabRoom), 0);
  if (addedCount === 0) return { inventory: { items, nextId }, overflow: quantity };
  else
    return {
      inventory: { items: [...items, { definition, id: nextId, quantity: addedCount }], nextId: nextId + 1 },
      overflow: quantity - addedCount,
    };
};
