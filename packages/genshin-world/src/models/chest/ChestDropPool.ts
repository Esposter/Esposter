import type { ChestRange } from "#src/models/chest/ChestRange";

// What one opening of a chest of a kind can pour out: the weapons one of which is picked, the artifact sets whose pieces
// Are rolled, and each material with the count it rolls within its range
export interface ChestDropPool {
  artifactSetIds: readonly number[];
  materials: { count: ChestRange; itemId: number }[];
  weaponItemIds: readonly number[];
}
