import type { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";

import { WORLD_DATA_DIRECTORY } from "#src/services/genshinAssets/shared/constants";
import { readWorldGroundHeight } from "#src/services/genshinAssets/shared/readWorldGroundHeight";
import { readWorldOptions } from "#src/services/genshinAssets/world/readWorldOptions";
import { readWorldOrigin } from "#src/services/genshinAssets/world/readWorldOrigin";
import { readWorldPlacements } from "#src/services/genshinAssets/world/readWorldPlacements";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

// What a region's landmarks are placed and checked from, read together: the landmarks the world names, the component's
// Placements and origin, the region's data file as it is, and the ground's height
export const readRegionLandmarkSources = async (
  component: DerivedAssetComponent,
  regionFile: string,
): Promise<{
  getWorldHeight: Awaited<ReturnType<typeof readWorldGroundHeight>>;
  origin: Awaited<ReturnType<typeof readWorldOrigin>>;
  placements: Awaited<ReturnType<typeof readWorldPlacements>>;
  regionJson: string;
  regionLandmarks: NonNullable<NonNullable<Awaited<ReturnType<typeof readWorldOptions>>>["regionLandmarks"]>;
}> => {
  const regionLandmarks = (await readWorldOptions(component))?.regionLandmarks ?? [];
  const [placements, origin, regionJson, getWorldHeight] = await Promise.all([
    readWorldPlacements(component),
    readWorldOrigin(component),
    readFile(join(WORLD_DATA_DIRECTORY, regionFile), "utf8"),
    readWorldGroundHeight(),
  ]);
  return { getWorldHeight, origin, placements, regionJson, regionLandmarks };
};
