import type { Inventory } from "#src/models/inventory/Inventory";
import type { InventoryAddition } from "#src/models/inventory/InventoryAddition";
import type { ItemDefinition } from "#src/models/inventory/ItemDefinition";

import { INVENTORY_KIND_LIMIT } from "#src/services/inventory/bagLimits";
import {
  WEAPON_START_ASCENSION,
  WEAPON_START_EXPERIENCE,
  WEAPON_START_LEVEL,
  WEAPON_START_REFINEMENT,
} from "#src/services/inventory/constants";
import { countCategoryPieces } from "#src/services/inventory/countCategoryPieces";
import { ItemCategoryRoomMap } from "#src/services/inventory/ItemCategoryRoomMap";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { ItemCategory } from "genshin-interface";

// The bag after taking in so many of an item, as the game takes a pick up. Each weapon is an entry of its own at its
// Starting state, and an artifact is taken in only as the artifact it was rolled as, through addInventoryArtifact.
// Anything else fills its stack up to the item's own limit, or opens a new one while the bag holds fewer kinds than its
// Limit. A tab counted on its own takes no more pieces than its room, and whatever does not fit is left over
export const addInventoryItem = (
  inventory: Inventory,
  definition: ItemDefinition,
  quantity: number,
): InventoryAddition => {
  if (definition.category === ItemCategory.Artifact)
    throw new InvalidOperationError(
      Operation.Create,
      addInventoryItem.name,
      "takes an artifact only as its rolled one",
    );
  const { items, nextId } = inventory;
  const { category } = definition;
  const categoryRoom = category === undefined ? undefined : ItemCategoryRoomMap[category];
  const tabRoom =
    category === undefined || categoryRoom === undefined
      ? Infinity
      : categoryRoom - countCategoryPieces(items, category);
  if (definition.category === ItemCategory.Weapon) {
    const addedCount = Math.max(Math.min(quantity, tabRoom), 0);
    const addedItems = Array.from({ length: addedCount }, (_value, index) => ({
      ascension: WEAPON_START_ASCENSION,
      definition,
      experience: WEAPON_START_EXPERIENCE,
      id: nextId + index,
      level: WEAPON_START_LEVEL,
      quantity: 1,
      refinement: WEAPON_START_REFINEMENT,
    }));
    return {
      inventory: { ...inventory, items: [...items, ...addedItems], nextId: nextId + addedCount },
      overflow: quantity - addedCount,
    };
  }

  const stack = items.find((item) => item.definition.id === definition.id);
  if (stack) {
    const addedCount = Math.max(Math.min(quantity, definition.stackLimit - stack.quantity, tabRoom), 0);
    return {
      inventory: {
        ...inventory,
        items: items.map((item) => (item === stack ? { ...item, quantity: item.quantity + addedCount } : item)),
      },
      overflow: quantity - addedCount,
    };
  }

  const kindCount = items.filter(
    ({ definition: { category: itemCategory } }) =>
      itemCategory === undefined || ItemCategoryRoomMap[itemCategory] === undefined,
  ).length;
  const addedCount =
    categoryRoom === undefined && kindCount >= INVENTORY_KIND_LIMIT
      ? 0
      : Math.max(Math.min(quantity, definition.stackLimit, tabRoom), 0);
  if (addedCount === 0) return { inventory, overflow: quantity };
  else
    return {
      inventory: {
        ...inventory,
        items: [...items, { definition, id: nextId, quantity: addedCount }],
        nextId: nextId + 1,
      },
      overflow: quantity - addedCount,
    };
};
