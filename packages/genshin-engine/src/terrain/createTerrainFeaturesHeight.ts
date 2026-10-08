import type { TerrainFeature } from "#src/models/terrain/TerrainFeature";

import { TerrainFeatureKind } from "#src/models/terrain/TerrainFeatureKind";
import { fileByCell } from "#src/terrain/fileByCell";
import { getCliffHeight } from "#src/terrain/getCliffHeight";
import { getPlateauHeight } from "#src/terrain/getPlateauHeight";
import { getRidgeHeight } from "#src/terrain/getRidgeHeight";
import { getTerrainFeatureBounds } from "#src/terrain/getTerrainFeatureBounds";

const TerrainFeatureKindHeightMap = {
  [TerrainFeatureKind.Cliff]: getCliffHeight,
  [TerrainFeatureKind.Plateau]: getPlateauHeight,
  [TerrainFeatureKind.Ridge]: getRidgeHeight,
} as const satisfies {
  [K in TerrainFeatureKind]: (feature: Extract<TerrainFeature, { kind: K }>, x: number, z: number) => number;
};
// The height the features add at any x and z, each feature filed under every cell its bounds cover as the hills are
export const createTerrainFeaturesHeight = (
  features: readonly TerrainFeature[],
): ((x: number, z: number) => number) => {
  const getFeatures = fileByCell(features, getTerrainFeatureBounds);
  return (x, z) => {
    let total = 0;
    for (const feature of getFeatures(x, z)) total += TerrainFeatureKindHeightMap[feature.kind](feature as never, x, z);
    return total;
  };
};
