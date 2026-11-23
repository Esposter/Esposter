import type { ExpMaterial } from "#src/models/inventory/ExpMaterial";
import type { ItemCount } from "#src/models/inventory/ItemCount";

// The Artifact EXP the enhancement materials among a set of item counts give, each material's EXP from the game's table
// Times its count
export const getMaterialExperience = (
  artifactExpMaterialMap: ReadonlyMap<number, ExpMaterial>,
  itemCounts: readonly ItemCount[],
): number =>
  itemCounts.reduce((total, { count, id }) => total + (artifactExpMaterialMap.get(id)?.experience ?? 0) * count, 0);
