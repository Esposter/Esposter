import type { GameDataBuild } from "#src/models/shared/GameDataBuild";
import type { FishingPointPlace } from "genshin-world";

import { FISHING_POINT_KIND, FISHING_POINT_LABEL_ID } from "#src/services/genshinAssets/fishing/constants";
import { placeFittedMapPoints } from "#src/services/genshinAssets/points/placeFittedMapPoints";
import { GameDataset } from "genshin-world";

// Every fishing point of the official map, carried into its region by the fit and built as one record of the fishing
// Dataset, keyed by region. The notes count each region's points and what was left out
export const buildFishingPoints = async (): Promise<GameDataBuild> => {
  const placement = await placeFittedMapPoints(
    new Map([[FISHING_POINT_LABEL_ID, FISHING_POINT_KIND]]),
    FISHING_POINT_KIND,
  );
  const regions = Object.entries(placement.places).toSorted(([firstRegion], [secondRegion]) =>
    firstRegion.localeCompare(secondRegion),
  );
  const regionPoints: Record<string, FishingPointPlace[]> = Object.fromEntries(
    regions.map(([region, places]) => [region, places.map(({ id, position }) => ({ id, position }))]),
  );
  return {
    notes: [
      ...regions.map(([region, places]) => `${region}: ${places.length} fishing points`),
      `${placement.skippedUnderground} on the layers under the ground and ${placement.skippedUnmapped} in no mapped region, left out`,
    ],
    objects: { [`${GameDataset.Fishing}/points`]: regionPoints },
  };
};
