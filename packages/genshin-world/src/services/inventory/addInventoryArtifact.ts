import type { Artifact } from "#src/models/artifact/Artifact";
import type { Inventory } from "#src/models/inventory/Inventory";
import type { InventoryAddition } from "#src/models/inventory/InventoryAddition";
import type { ItemDefinition } from "#src/models/inventory/ItemDefinition";

import { countCategoryPieces } from "#src/services/inventory/countCategoryPieces";
import { ItemCategoryRoomMap } from "#src/services/inventory/ItemCategoryRoomMap";

// The bag after taking in one artifact as it was rolled, as the game takes a drop: an entry of its own holding the artifact
// And its stats, so each artifact keeps its own. The artifacts tab's room decides whether it fits, and one that does not
// Is left over
export const addInventoryArtifact = (
  { items, nextId, quickSwapItemIds }: Inventory,
  definition: ItemDefinition,
  artifact: Artifact,
): InventoryAddition => {
  const categoryRoom = ItemCategoryRoomMap[definition.category];
  const tabRoom =
    categoryRoom === undefined ? Infinity : categoryRoom - countCategoryPieces(items, definition.category);
  if (tabRoom < 1) return { inventory: { items, nextId, quickSwapItemIds }, overflow: 1 };
  return {
    inventory: {
      items: [...items, { artifact, definition, id: nextId, quantity: 1 }],
      nextId: nextId + 1,
      quickSwapItemIds,
    },
    overflow: 0,
  };
};
