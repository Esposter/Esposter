import type { Artifact } from "#src/models/artifact/Artifact";
import type { ItemDefinition } from "#src/models/inventory/ItemDefinition";

// One entry of the bag: a stack of an item, or a single weapon or artifact. A weapon's entry holds its level, its ascension,
// The EXP it holds towards the next level and its refinement rank. An artifact's entry holds the artifact itself, rolled
// As it dropped, so each one keeps its own stats. Its id is the bag's own count of the entries it has taken in, so it never
// Repeats and runs in the order they were obtained, and it is the artifact's instance id
export interface InventoryItem {
  artifact?: Artifact;
  ascension?: number;
  definition: ItemDefinition;
  experience?: number;
  id: number;
  level?: number;
  quantity: number;
  refinement?: number;
}
