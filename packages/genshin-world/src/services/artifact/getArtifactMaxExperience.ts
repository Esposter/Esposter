import type { ArtifactRarityData } from "#src/models/artifact/ArtifactRarityData";

import { getArtifactExperienceToLevel } from "#src/services/artifact/getArtifactExperienceToLevel";

// The EXP an artifact of a rarity takes to reach its top level, every level's cost added together
export const getArtifactMaxExperience = (rarityData: ArtifactRarityData): number =>
  getArtifactExperienceToLevel(rarityData, rarityData.levelExperiences.length);
