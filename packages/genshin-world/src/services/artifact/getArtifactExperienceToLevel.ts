import type { ArtifactRarityData } from "#src/models/artifact/ArtifactRarityData";

// The EXP an artifact of a rarity takes to reach a level, every level's cost below it added together
export const getArtifactExperienceToLevel = (rarityData: ArtifactRarityData, level: number): number =>
  rarityData.levelExperiences.slice(0, level).reduce((total, levelExperience) => total + levelExperience, 0);
