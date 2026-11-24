import type { InteractiveMapPoint } from "#src/models/genshinAssets/points/InteractiveMapPoint";
import type { InteractiveMapRegionFit } from "#src/models/genshinAssets/points/InteractiveMapRegionFit";
import type { SimilarityTransform } from "#src/models/genshinAssets/points/SimilarityTransform";
import type { RegionDataFile } from "#src/models/genshinAssets/residents/RegionDataFile";
import type { RegionMapPoint } from "#src/services/genshinAssets/residents/classifyPlacementRegion";

import { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import { readFittedMapPoints } from "#src/services/genshinAssets/points/readFittedMapPoints";
import { toFittedMapPoints } from "#src/services/genshinAssets/residents/toFittedMapPoints";
import { readRegionData } from "#src/services/genshinAssets/shared/readRegionData";
import { readWorldOrigin } from "#src/services/genshinAssets/world/readWorldOrigin";

// The regions the fit placed, each with its data file's path under the world package's data and the file as it holds
// It, and the official map's ground points in those regions carried into the game's axes, which the places filed into a
// Region are classified against. The origin is the one the places are carried round, and the points and transform are
// The fit's own, which the outcrops and waypoints are placed from
export const readFittedRegions = async (): Promise<{
  origin: [number, number, number];
  points: InteractiveMapPoint[];
  regionFiles: { data: RegionDataFile; file: string; region: string }[];
  regionFits: InteractiveMapRegionFit[];
  regionMapPoints: RegionMapPoint[];
  transform: SimilarityTransform;
}> => {
  const [origin, fittedMapPoints] = await Promise.all([
    readWorldOrigin(DerivedAssetComponent.Windrise),
    readFittedMapPoints(),
  ]);
  const { fittedRegions, regionMapPoints } = toFittedMapPoints(fittedMapPoints);
  const regionFiles = await Promise.all(
    fittedRegions.map(async ({ region }) => ({ ...(await readRegionData(region)), region })),
  );
  return {
    origin,
    points: fittedMapPoints.points,
    regionFiles,
    regionFits: fittedMapPoints.regions,
    regionMapPoints,
    transform: fittedMapPoints.transform,
  };
};
