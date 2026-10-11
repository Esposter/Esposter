import type { TerrainFeatureShape } from "#src/models/genshinAssets/fit/TerrainFeatureShape";
import type { TerrainFeature } from "genshin-engine";

import { getTerrainFeatureBounds, TerrainFeatureKindBlendMap } from "genshin-engine";

// The samples a feature centred on a grid's sample covers, as row and column shifts from it out to its bounds, each
// With the share of its height the engine draws there, and the most samples any of them lies from it. A height fitted
// To these is the height the feature is drawn at, so a placement never claims a gain its drawing does not give
export const computeFeatureOffsets = (
  feature: TerrainFeature,
  step: number,
): Pick<TerrainFeatureShape<TerrainFeature>, "offsets" | "reach"> => {
  const { maxX, maxZ, minX, minZ } = getTerrainFeatureBounds(feature);
  const reach = Math.ceil(Math.max(-minX, maxX, -minZ, maxZ) / step);
  const getBlend = TerrainFeatureKindBlendMap[feature.kind];
  const offsets: [number, number, number][] = [];
  for (let rowShift = -reach; rowShift <= reach; rowShift++)
    for (let columnShift = -reach; columnShift <= reach; columnShift++) {
      const weight = getBlend(feature as never, columnShift * step, rowShift * step);
      if (weight > 0) offsets.push([rowShift, columnShift, weight]);
    }
  return { offsets, reach };
};
