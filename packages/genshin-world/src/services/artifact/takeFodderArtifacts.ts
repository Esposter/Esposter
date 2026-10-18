import type { Artifact } from "#src/models/artifact/Artifact";
import type { Inventory } from "#src/models/inventory/Inventory";

import { takeInventoryEntry } from "#src/services/inventory/takeInventoryEntry";
import { InvalidOperationError, Operation } from "@esposter/shared";

// The artifacts picked as fodder, taken out of the bag. An entry that is not an artifact, or an artifact that is locked,
// Is refused, since a locked artifact is never fodder
export const takeFodderArtifacts = (
  inventory: Inventory,
  entryIds: number[],
): { fodders: Artifact[]; inventory: Inventory } => {
  const fodders = entryIds.map((entryId) => {
    const artifact = inventory.items.find(({ id }) => id === entryId)?.artifact;
    if (!artifact || artifact.isLocked)
      throw new InvalidOperationError(
        Operation.Update,
        takeFodderArtifacts.name,
        `entry ${entryId} is not an unlocked artifact`,
      );
    return artifact;
  });
  const items = entryIds.reduce((remaining, entryId) => takeInventoryEntry(remaining, entryId), inventory.items);
  return { fodders, inventory: { ...inventory, items } };
};
