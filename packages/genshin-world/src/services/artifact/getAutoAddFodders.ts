import type { Artifact } from "#src/models/artifact/Artifact";
import type { ArtifactRarityData } from "#src/models/artifact/ArtifactRarityData";
import type { Inventory } from "#src/models/inventory/Inventory";

import { getArtifactRarityData } from "#src/services/artifact/getArtifactRarityData";
import { getFodderEnhancement } from "#src/services/artifact/getFodderEnhancement";

// The bag's entries Auto Add feeds an artifact: its unlocked artifacts up to the star cap, the lowest star first and then
// The lowest level. Each is taken while the EXP still falls short of the artifact's top level, and the last one taken may
// Carry the EXP past it, which enhanceArtifact then loses
export const getAutoAddFodders = ({
  artifact,
  artifactRarityDataMap,
  inventory,
  maxRarity,
}: {
  artifact: Artifact;
  artifactRarityDataMap: ReadonlyMap<number, ArtifactRarityData>;
  inventory: Inventory;
  maxRarity: number;
}): number[] => {
  const rarityData = getArtifactRarityData(artifactRarityDataMap, artifact.rarity);
  const totalExperience = rarityData.levelExperiences.reduce((total, levelExperience) => total + levelExperience, 0);
  const fodders = inventory.items
    .flatMap(({ artifact: fodder, id }) =>
      fodder && !fodder.isLocked && fodder.rarity <= maxRarity ? [{ fodder, id }] : [],
    )
    .toSorted((a, b) => a.fodder.rarity - b.fodder.rarity || a.fodder.level - b.fodder.level);
  let remainingExperience = totalExperience - artifact.experience;
  const ids: number[] = [];
  for (const { fodder, id } of fodders) {
    if (remainingExperience <= 0) break;
    ids.push(id);
    remainingExperience -= getFodderEnhancement(fodder, artifactRarityDataMap).experience;
  }
  return ids;
};
