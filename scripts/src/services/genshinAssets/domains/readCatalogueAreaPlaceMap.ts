import type { WorldArea } from "#src/models/genshinAssets/world/WorldArea";

import { toCatalogueAreaPlaceMap } from "#src/services/genshinAssets/domains/toCatalogueAreaPlaceMap";
import { CATALOGUE_PATH, WORLD_AREAS_TABLE_NAME } from "#src/services/genshinAssets/shared/constants";
import { readExcelTable } from "#src/services/genshinText/readExcelTable";
import { readTextMap } from "#src/services/genshinText/readTextMap";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { GameLanguage } from "genshin-text";
import { catalogueSchema } from "genshin-world";
import { readFile } from "node:fs/promises";

// Each of the open world's level-one areas by its id in the game's area table, with the catalogue area of its English name
// And the region holding it, which a scene point's own area is filed under
export const readCatalogueAreaPlaceMap = async (): Promise<Map<number, { areaId: string; region: string }>> => {
  const { regions } = catalogueSchema.parse(parseMachineJson(await readFile(CATALOGUE_PATH, "utf8")));
  return toCatalogueAreaPlaceMap({
    areas: readExcelTable<WorldArea>(WORLD_AREAS_TABLE_NAME),
    regions,
    textMap: readTextMap(GameLanguage.English),
  });
};
