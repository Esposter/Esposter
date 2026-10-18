import type { ArtifactSlot } from "#src/models/artifact/ArtifactSlot";
import type { Inventory } from "#src/models/inventory/Inventory";
import type { InventoryItem } from "#src/models/inventory/InventoryItem";

// The bag's artifacts of a slot in the game's order, the highest rarity first and then the highest level, so the one a
// Player reaches for first is first
export const getBagArtifactsForSlot = (
  inventory: Inventory,
  slot: ArtifactSlot,
): Required<Pick<InventoryItem, "artifact" | "definition" | "id">>[] =>
  inventory.items
    .flatMap(({ artifact, definition, id }) => (artifact?.slot === slot ? [{ artifact, definition, id }] : []))
    .toSorted((a, b) => b.artifact.rarity - a.artifact.rarity || b.artifact.level - a.artifact.level);
