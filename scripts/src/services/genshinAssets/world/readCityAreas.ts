import type { CityArea } from "#src/models/genshinAssets/world/CityArea";

import { readGameVersion } from "#src/services/genshinAssets/shared/readGameVersion";
import { CITY_AREA_FILE_PATH } from "#src/services/genshinAssets/world/constants";
import { readCityAreaFile } from "#src/services/genshinAssets/world/readCityAreaFile";
import { InvalidOperationError, Operation } from "@esposter/shared";

// Every city area of the installed game, which `city-areas` must have read for this version
export const readCityAreas = async (): Promise<CityArea[]> => {
  const file = await readCityAreaFile();
  if (!file)
    throw new InvalidOperationError(Operation.Read, CITY_AREA_FILE_PATH, "is missing: run `genshin:assets city-areas`");
  const gameVersion = await readGameVersion();
  if (file.gameVersion !== gameVersion)
    throw new InvalidOperationError(
      Operation.Read,
      CITY_AREA_FILE_PATH,
      `is for game ${file.gameVersion}, not ${gameVersion}: run \`genshin:assets city-areas\` again`,
    );
  return file.areas;
};
