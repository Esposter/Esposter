import type { PlaceLandmark } from "genshin-world";

import { WORLD_DATA_DIRECTORY } from "#src/services/genshinAssets/shared/constants";
import { readRegionFilenames } from "#src/services/genshinAssets/shared/readRegionFilenames";
import { readWorldRecord } from "#src/services/genshinAssets/shared/readWorldRecord";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { join } from "node:path";

// The landmarks of every region file, in the order the files list: the authored places, since a region's rocks are
// Fitted records of their own and are never in the file. A region file's sidecar stamp is not a region
export const readRegionLandmarks = async (): Promise<PlaceLandmark[]> => {
  const regionFiles = await readRegionFilenames(join(WORLD_DATA_DIRECTORY, "regions"));
  return (
    await Promise.all(
      regionFiles.map(
        async (file) =>
          parseMachineJson<{ landmarks: PlaceLandmark[] }>(await readWorldRecord(join("regions", file))).landmarks,
      ),
    )
  ).flat();
};
