import type { RegionCampsData } from "#src/models/genshinAssets/enemies/RegionCampsData";

import { REGIONS_DIRECTORY } from "#src/services/genshinAssets/enemies/constants";
import { WORLD_DATA_DIRECTORY } from "#src/services/genshinAssets/shared/constants";
import { readRegionFilenames } from "#src/services/genshinAssets/shared/readRegionFilenames";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

// The enemy camps of every region, each region's record read off its own file in the world's data
export const readRegionCampsData = async (): Promise<RegionCampsData[]> => {
  const regionsDirectory = join(WORLD_DATA_DIRECTORY, REGIONS_DIRECTORY);
  const regionFilenames = await readRegionFilenames(regionsDirectory);
  return Promise.all(
    regionFilenames.map(async (filename) =>
      parseMachineJson<RegionCampsData>(await readFile(join(regionsDirectory, filename), "utf8")),
    ),
  );
};
