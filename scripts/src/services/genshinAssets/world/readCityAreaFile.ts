import type { CityAreaFile } from "#src/models/genshinAssets/world/CityAreaFile";

import { CITY_AREA_FILE_PATH } from "#src/services/genshinAssets/world/constants";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";

// The city areas `city-areas` wrote, of whatever game version, or nothing where it has not been run
export const readCityAreaFile = async (): Promise<CityAreaFile | undefined> =>
  existsSync(CITY_AREA_FILE_PATH)
    ? parseMachineJson<CityAreaFile>(await readFile(CITY_AREA_FILE_PATH, "utf8"))
    : undefined;
