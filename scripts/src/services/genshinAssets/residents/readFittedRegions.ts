import type { InteractiveMapPoint } from "#src/models/genshinAssets/points/InteractiveMapPoint";
import type { SimilarityTransform } from "#src/models/genshinAssets/points/SimilarityTransform";
import type { RegionDataFile } from "#src/models/genshinAssets/residents/RegionDataFile";
import type { RegionMapPoint } from "#src/services/genshinAssets/residents/classifyPlacementRegion";

import { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import { readFittedMapPoints } from "#src/services/genshinAssets/points/readFittedMapPoints";
import { toFittedMapPoints } from "#src/services/genshinAssets/residents/toFittedMapPoints";
import { WORLD_DATA_DIRECTORY } from "#src/services/genshinAssets/shared/constants";
import { readWorldOrigin } from "#src/services/genshinAssets/world/readWorldOrigin";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

// The regions the fit placed, each with its data file's path under the world package's data and the file as it holds it,
// And the official map's ground points in those regions carried into the game's axes, which the places filed into a region
// Are classified against. The origin is the one the places are carried round, and the points and transform are the fit's
// Own, which the outcrops and waypoints are placed from
export const readFittedRegions = async (): Promise<{
  origin: [number, number, number];
  points: InteractiveMapPoint[];
  regionFiles: { data: RegionDataFile; file: string; region: string }[];
  regionMapPoints: RegionMapPoint[];
  transform: SimilarityTransform;
}> => {
  const [origin, fittedMapPoints] = await Promise.all([
    readWorldOrigin(DerivedAssetComponent.Windrise),
    readFittedMapPoints(),
  ]);
  const { fittedRegions, regionMapPoints } = toFittedMapPoints(fittedMapPoints);
  const regionFiles = await Promise.all(
    fittedRegions.map(async ({ region }) => {
      const file = join("regions", `${region}.json`);
      const data = parseMachineJson<RegionDataFile>(await readFile(join(WORLD_DATA_DIRECTORY, file), "utf8"));
      return { data, file, region };
    }),
  );
  return { origin, points: fittedMapPoints.points, regionFiles, regionMapPoints, transform: fittedMapPoints.transform };
};
