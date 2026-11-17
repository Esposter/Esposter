import type { TerrainFeature } from "#src/models/terrain/TerrainFeature";

import { fileByCell } from "#src/terrain/fileByCell";
import { getTerrainFeatureBlend } from "#src/terrain/getTerrainFeatureBlend";
import { getTerrainFeatureBounds } from "#src/terrain/getTerrainFeatureBounds";

// How fully the features stand at any x and z: the largest share of its height any feature reaching the point stands
// There, one inside a plateau's top and none past every feature's reach
export const createTerrainFeaturesBlend = (features: readonly TerrainFeature[]): ((x: number, z: number) => number) => {
  const getFeatures = fileByCell(features, getTerrainFeatureBounds);
  return (x, z) => {
    let blend = 0;
    for (const feature of getFeatures(x, z))
      blend = Math.max(blend, getTerrainFeatureBlend(feature.kind, feature, x, z));
    return blend;
  };
};
