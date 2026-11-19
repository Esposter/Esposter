import type { RegionCityIds } from "#src/models/leyLine/RegionCityIds";

import { regionCityIdsSchema } from "#src/models/leyLine/RegionCityIds";
import { readGameData } from "#src/services/data/readGameData";

// Each region's city as `pnpm -C scripts genshin:assets outcrops` publishes it, fetched by its key from the hosted game data
export const readRegionCityIds = (gameDataBaseUrl: string): Promise<RegionCityIds> =>
  readGameData(gameDataBaseUrl, "leyLine/cities", regionCityIdsSchema);
