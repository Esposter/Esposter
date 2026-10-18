import type { ArtifactRarityData } from "#src/models/artifact/ArtifactRarityData";

// Each star count's rarity data by its star count, which an artifact reads its enhancement and its rolls from
export const createArtifactRarityDataMap = (
  artifactRarities: readonly ArtifactRarityData[],
): Map<number, ArtifactRarityData> =>
  new Map(artifactRarities.map((rarityData): [number, ArtifactRarityData] => [rarityData.rarity, rarityData]));
