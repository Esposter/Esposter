import type { ArtifactRarityData } from "#src/models/artifact/ArtifactRarityData";

import { InvalidOperationError, Operation } from "@esposter/shared";

// The table of an artifact's rarity, which the game's tables hold for every rarity an artifact has
export const getArtifactRarityData = (
  artifactRarityDataMap: ReadonlyMap<number, ArtifactRarityData>,
  rarity: number,
): ArtifactRarityData => {
  const rarityData = artifactRarityDataMap.get(rarity);
  if (!rarityData)
    throw new InvalidOperationError(Operation.Read, "getArtifactRarityData", `no table holds rarity ${rarity}`);
  return rarityData;
};
