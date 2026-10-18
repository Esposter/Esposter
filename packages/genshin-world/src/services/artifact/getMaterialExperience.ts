import type { ArtifactExpMaterial } from "#src/models/artifact/ArtifactExpMaterial";
import type { ItemCount } from "#src/models/inventory/ItemCount";

// The Artifact EXP the enhancement materials among a set of item counts give, each material's EXP from the game's table
// Times its count
export const getMaterialExperience = (
  artifactExpMaterialMap: ReadonlyMap<number, ArtifactExpMaterial>,
  itemCounts: readonly ItemCount[],
): number =>
  itemCounts.reduce((total, { count, id }) => total + (artifactExpMaterialMap.get(id)?.experience ?? 0) * count, 0);
