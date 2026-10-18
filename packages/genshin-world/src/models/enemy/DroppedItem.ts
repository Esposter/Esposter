import type { Artifact } from "#src/models/artifact/Artifact";

// So many of one item, by the game's item id. An artifact drop also holds the artifact rolled as it dropped, so the bag
// Takes that artifact with its stats and not a fresh one
export interface DroppedItem {
  artifact?: Artifact;
  count: number;
  itemId: number;
}
