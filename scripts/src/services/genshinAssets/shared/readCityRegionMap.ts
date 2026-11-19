import type { DumpedCity } from "#src/models/genshinText/DumpedCity";

import { readCatalogueAreaPlaceMap } from "#src/services/genshinAssets/shared/readCatalogueAreaPlaceMap";
import { toCityRegionMap } from "#src/services/genshinAssets/shared/toCityRegionMap";
import { CITY_TABLE_NAME } from "#src/services/genshinText/constants";
import { readExcelTable } from "#src/services/genshinText/readExcelTable";

// Every city of the game's city table filed under the region its areas lie in, read from the dump and the catalogue
export const readCityRegionMap = async (): Promise<Map<number, string>> =>
  toCityRegionMap(readExcelTable<DumpedCity>(CITY_TABLE_NAME), await readCatalogueAreaPlaceMap());
