import type { Inventory } from "#src/models/inventory/Inventory";

import { InvalidOperationError, Operation } from "@esposter/shared";

// A bag artifact is locked or unlocked by its entry's id, so fodder never takes it. An entry that holds no artifact, or no
// Entry of that id, is refused
export const toggleInventoryArtifactLock = (inventory: Inventory, entryId: number): Inventory => {
  const entry = inventory.items.find(({ id }) => id === entryId);
  if (!entry?.artifact)
    throw new InvalidOperationError(
      Operation.Update,
      toggleInventoryArtifactLock.name,
      `entry ${entryId} is not an artifact`,
    );
  return {
    ...inventory,
    items: inventory.items.map((item) =>
      item === entry ? { ...item, artifact: { ...entry.artifact, isLocked: !entry.artifact.isLocked } } : item,
    ),
  };
};
