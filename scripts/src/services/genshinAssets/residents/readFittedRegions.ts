import type { RegionDataFile } from "#src/models/genshinAssets/residents/RegionDataFile";
import type { RegionMapPoint } from "#src/services/genshinAssets/residents/classifyPlacementRegion";

import { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import { readFittedMapPoints } from "#src/services/genshinAssets/points/readFittedMapPoints";
import { toRegionMapPoints } from "#src/services/genshinAssets/residents/toRegionMapPoints";
import { WORLD_DATA_DIRECTORY } from "#src/services/genshinAssets/shared/constants";
import { readWorldOrigin } from "#src/services/genshinAssets/world/readWorldOrigin";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

// The regions the fit placed, each with its data file's path under the world package's data and the file as it holds it,
// And the official map's ground points in those regions carried into the game's axes, which the places filed into a region
// Are classified against. The origin is the one the places are carried round
export const readFittedRegions = async (): Promise<{
  origin: [number, number, number];
  regionFiles: { data: RegionDataFile; file: string; region: string }[];
  regionMapPoints: RegionMapPoint[];
}> => {
  const [origin, { points, regions, transform }] = await Promise.all([
    readWorldOrigin(DerivedAssetComponent.Windrise),
    readFittedMapPoints(),
  ]);
  const fittedRegions = regions.filter(({ residual }) => residual !== undefined);
  const regionFiles = await Promise.all(
    fittedRegions.map(async ({ region }) => {
      const file = join("regions", `${region}.json`);
      const data = parseMachineJson<RegionDataFile>(await readFile(join(WORLD_DATA_DIRECTORY, file), "utf8"));
      return { data, file, region };
    }),
  );
  const regionMapPoints = toRegionMapPoints(points, transform).filter(({ region }) =>
    fittedRegions.some((fitted) => fitted.region === region),
  );
  return { origin, regionFiles, regionMapPoints };
};
