import type { InteractiveMapPoint } from "#src/models/genshinAssets/points/InteractiveMapPoint";
import type { SimilarityTransform } from "#src/models/genshinAssets/points/SimilarityTransform";
import type { RegionMapPoint } from "#src/services/genshinAssets/residents/classifyPlacementRegion";

import { applySimilarityTransform } from "#src/services/genshinAssets/points/applySimilarityTransform";
import { GROUND_LAYER } from "#src/services/genshinAssets/points/constants";
import { InteractiveMapRegionMap } from "#src/services/genshinAssets/points/InteractiveMapRegionMap";

// The official map's ground points, each in a mapped region, carried into the game's axes by the fit and named by that
// Region. A point in an area no region is mapped to, or on a layer under the ground, places no resident's region
export const toRegionMapPoints = (
  points: readonly InteractiveMapPoint[],
  transform: SimilarityTransform,
): RegionMapPoint[] => {
  const areaIdRegionMap = new Map(
    Object.entries(InteractiveMapRegionMap).map(([region, { areaId }]) => [areaId, region]),
  );
  return points.flatMap((point) => {
    const region = areaIdRegionMap.get(point.area_id);
    if (region === undefined || point.z_level !== GROUND_LAYER) return [];
    return [{ position: applySimilarityTransform(transform, { x: point.x_pos, z: point.y_pos }), region }];
  });
};
