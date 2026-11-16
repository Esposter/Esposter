import type { ArtifactSlot } from "#src/models/artifact/ArtifactSlot";
import type { Inventory } from "#src/models/inventory/Inventory";

// The bag's artifacts of a slot in the game's order, the highest rarity first and then the highest level, so the one a
// Player reaches for first is first
export const getBagArtifactsForSlot = (inventory: Inventory, slot: ArtifactSlot) =>
  inventory.items
    .flatMap(({ artifact, definition, id }) => (artifact?.slot === slot ? [{ artifact, definition, id }] : []))
    .toSorted(
      (firstEntry, secondEntry) =>
        secondEntry.artifact.rarity - firstEntry.artifact.rarity ||
        secondEntry.artifact.level - firstEntry.artifact.level,
    );
