import type { Artifact } from "#src/models/artifact/Artifact";
import type { ArtifactRarityData } from "#src/models/artifact/ArtifactRarityData";

import { getFodderEnhancement } from "#src/services/artifact/getFodderEnhancement";

// What an enhancement costs in Mora: a point for each EXP its materials bring and for each fodder's base EXP
export const getEnhancementMoraCost = ({
  artifactRarityDataMap,
  fodders,
  materialExperience,
}: {
  artifactRarityDataMap: ReadonlyMap<number, ArtifactRarityData>;
  fodders: readonly Artifact[];
  materialExperience: number;
}): number =>
  fodders.reduce(
    (total, fodder) => total + getFodderEnhancement(fodder, artifactRarityDataMap).mora,
    materialExperience,
  );
