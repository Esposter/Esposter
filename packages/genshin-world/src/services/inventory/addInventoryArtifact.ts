import type { Artifact } from "#src/models/artifact/Artifact";
import type { Inventory } from "#src/models/inventory/Inventory";
import type { InventoryAddition } from "#src/models/inventory/InventoryAddition";
import type { ItemCategoryRoomMap } from "#src/models/inventory/ItemCategoryRoomMap";
import type { ItemDefinition } from "#src/models/inventory/ItemDefinition";

import { countCategoryPieces } from "#src/services/inventory/countCategoryPieces";
import { ItemCategory } from "genshin-interface";

// The bag after taking in one artifact as it was rolled, as the game takes a drop: an entry of its own holding the
// Artifact and its stats, so each artifact keeps its own. The artifacts tab's room decides whether it fits, and one
// That does not is left over
export const addInventoryArtifact = (
  inventory: Inventory,
  definition: ItemDefinition,
  artifact: Artifact,
  itemRooms: ItemCategoryRoomMap,
): InventoryAddition => {
  const { items, nextId } = inventory;
  const categoryRoom = itemRooms[ItemCategory.Artifact];
  const tabRoom =
    categoryRoom === undefined ? Infinity : categoryRoom - countCategoryPieces(items, ItemCategory.Artifact);
  if (tabRoom < 1) return { inventory, overflow: 1 };
  return {
    inventory: {
      ...inventory,
      items: [...items, { artifact, definition, id: nextId, quantity: 1 }],
      nextId: nextId + 1,
    },
    overflow: 0,
  };
};
