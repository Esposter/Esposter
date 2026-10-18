import type { GroundSource } from "#src/models/genshinAssets/fit/GroundSource";
import type { Landmark } from "genshin-world";

import { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import { WORLD_DATA_DIRECTORY } from "#src/services/genshinAssets/shared/constants";
import { readWorldOrigin } from "#src/services/genshinAssets/world/readWorldOrigin";
import { readWorldTerrainHeight } from "#src/services/genshinAssets/world/readWorldTerrainHeight";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

// The landmarks of every region file, in the order the files list
const readRegionLandmarks = async (): Promise<Landmark[]> => {
  const regionsDirectory = join(WORLD_DATA_DIRECTORY, "regions");
  const regionFiles = await readdir(regionsDirectory);
  return (
    await Promise.all(
      regionFiles.map(
        async (file) =>
          parseMachineJson<{ landmarks: Landmark[] }>(await readFile(join(regionsDirectory, file), "utf8")).landmarks,
      ),
    )
  ).flat();
};

// A region's ground source, read together so every piece and quarter of the region fits from the one read
export const readGroundSource = async (region: DerivedAssetComponent): Promise<GroundSource> => {
  const [getGameHeight, origin, landmarks] = await Promise.all([
    readWorldTerrainHeight(region),
    readWorldOrigin(DerivedAssetComponent.Windrise),
    readRegionLandmarks(),
  ]);
  return { getGameHeight, landmarks, origin };
};
