import type { FishingPointPlace } from "genshin-world";

import { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import {
  FISHING_POINT_KIND,
  FISHING_POINT_LABEL_ID,
  FISHING_POINTS_PATH,
} from "#src/services/genshinAssets/fishing/constants";
import { placeMapPoints } from "#src/services/genshinAssets/points/placeMapPoints";
import { readFittedMapPoints } from "#src/services/genshinAssets/points/readFittedMapPoints";
import { readWorldOrigin } from "#src/services/genshinAssets/world/readWorldOrigin";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";

// Every fishing point of the official map, carried into its region by the fit and written as one file of the world's
// Generated folder. The report counts each region's points and what was left out
export const writeFishingPoints = async (): Promise<string> => {
  const [origin, { points, transform }] = await Promise.all([
    readWorldOrigin(DerivedAssetComponent.Windrise),
    readFittedMapPoints(),
  ]);
  const placement = placeMapPoints(
    points,
    transform,
    new Map([[FISHING_POINT_LABEL_ID, FISHING_POINT_KIND]]),
    FISHING_POINT_KIND,
    origin,
  );
  const regions = Object.entries(placement.places).toSorted(([firstRegion], [secondRegion]) =>
    firstRegion.localeCompare(secondRegion),
  );
  const regionPoints: Record<string, FishingPointPlace[]> = Object.fromEntries(
    regions.map(([region, places]) => [region, places.map(({ id, position }) => ({ id, position }))]),
  );
  await mkdir(dirname(FISHING_POINTS_PATH), { recursive: true });
  await writeFile(FISHING_POINTS_PATH, `${JSON.stringify(regionPoints)}\n`);
  return [
    ...regions.map(([region, places]) => `${region}: ${places.length} fishing points`),
    `${placement.skippedUnderground} on the layers under the ground and ${placement.skippedUnmapped} in no mapped region, left out`,
    FISHING_POINTS_PATH,
  ].join("\n");
};
