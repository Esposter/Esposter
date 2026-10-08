import type { Artifact } from "#src/models/artifact/Artifact";
import type { ArtifactRarityData } from "#src/models/artifact/ArtifactRarityData";

import { FODDER_RECOVERY_RATE } from "#src/services/artifact/constants";
import { getArtifactRarityData } from "#src/services/artifact/getArtifactRarityData";
import { InvalidOperationError, Operation } from "@esposter/shared";

// What a fodder artifact feeds an enhancement: its rarity's base EXP and the share of what it was levelled with that the
// Game gives back. The base costs a Mora a point and the share costs nothing. A locked artifact is never fodder
export const getFodderEnhancement = (
  fodder: Artifact,
  artifactRarityDataMap: ReadonlyMap<number, ArtifactRarityData>,
): { experience: number; mora: number } => {
  if (fodder.isLocked)
    throw new InvalidOperationError(Operation.Update, "getFodderEnhancement", "a locked artifact is never fodder");
  const { baseExperience } = getArtifactRarityData(artifactRarityDataMap, fodder.rarity);
  return { experience: baseExperience + Math.floor(fodder.experience * FODDER_RECOVERY_RATE), mora: baseExperience };
};
