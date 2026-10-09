import type { CityAreaFile } from "#src/models/genshinAssets/world/CityAreaFile";

import { readGameVersion } from "#src/services/genshinAssets/shared/readGameVersion";
import { CITY_AREA_FILE_PATH } from "#src/services/genshinAssets/world/constants";
import { extractCityAreas } from "#src/services/genshinAssets/world/extractCityAreas";
import { readCityAreaCandidates } from "#src/services/genshinAssets/world/readCityAreaCandidates";
import { readCityAreaFile } from "#src/services/genshinAssets/world/readCityAreaFile";
import { writeJsonFile } from "#src/services/shared/writeJsonFile";
import { mkdir } from "node:fs/promises";
import { dirname } from "node:path";

// Every city area's extent for the installed game, read from the install once per game version and kept beside the
// Exports. A file of the same version is returned as it is
export const buildCityAreas = async (): Promise<CityAreaFile> => {
  const gameVersion = await readGameVersion();
  const cached = await readCityAreaFile();
  if (cached?.gameVersion === gameVersion) return cached;
  const candidates = await readCityAreaCandidates();
  const file: CityAreaFile = {
    areas: await extractCityAreas(candidates),
    candidateCount: candidates.length,
    gameVersion,
  };
  await mkdir(dirname(CITY_AREA_FILE_PATH), { recursive: true });
  writeJsonFile(CITY_AREA_FILE_PATH, file);
  return file;
};
