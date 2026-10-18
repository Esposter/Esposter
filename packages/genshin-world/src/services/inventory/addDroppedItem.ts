import type { DroppedItem } from "#src/models/enemy/DroppedItem";
import type { Inventory } from "#src/models/inventory/Inventory";
import type { InventoryAddition } from "#src/models/inventory/InventoryAddition";
import type { ItemDefinition } from "#src/models/inventory/ItemDefinition";

import { addInventoryArtifact } from "#src/services/inventory/addInventoryArtifact";
import { addInventoryItem } from "#src/services/inventory/addInventoryItem";

// The bag after taking in one dropped item, its definition read from its item id: an artifact as the artifact it was
// Rolled as, and anything else by its count, so a drop keeps the stats it rolled wherever the bag takes it in
export const addDroppedItem = (
  inventory: Inventory,
  { artifact, count }: DroppedItem,
  definition: ItemDefinition,
): InventoryAddition =>
  artifact === undefined
    ? addInventoryItem(inventory, definition, count)
    : addInventoryArtifact(inventory, definition, artifact);
