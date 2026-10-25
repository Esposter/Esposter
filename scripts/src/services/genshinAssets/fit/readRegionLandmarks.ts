import type { Landmark } from "genshin-world";

import { WORLD_DATA_DIRECTORY } from "#src/services/genshinAssets/shared/constants";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

// The landmarks of every region file, in the order the files list
export const readRegionLandmarks = async (): Promise<Landmark[]> => {
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
