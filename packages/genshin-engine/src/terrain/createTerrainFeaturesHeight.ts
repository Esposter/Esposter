import type { TerrainFeature } from "#src/models/terrain/TerrainFeature";

import { fileByCell } from "#src/terrain/fileByCell";
import { getTerrainFeatureBounds } from "#src/terrain/getTerrainFeatureBounds";
import { TerrainFeatureKindBlendMap } from "#src/terrain/TerrainFeatureKindBlendMap";

// The height the features add at any x and z, each feature filed under every cell its bounds cover as the hills are
export const createTerrainFeaturesHeight = (
  features: readonly TerrainFeature[],
): ((x: number, z: number) => number) => {
  const getFeatures = fileByCell(features, getTerrainFeatureBounds);
  return (x, z) => {
    let total = 0;
    for (const feature of getFeatures(x, z))
      total += feature.height * TerrainFeatureKindBlendMap[feature.kind](feature as never, x, z);
    return total;
  };
};
