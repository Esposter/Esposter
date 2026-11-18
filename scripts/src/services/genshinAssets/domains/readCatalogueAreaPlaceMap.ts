import type { WorldArea } from "#src/models/genshinAssets/world/WorldArea";

import { toCatalogueAreaPlaceMap } from "#src/services/genshinAssets/domains/toCatalogueAreaPlaceMap";
import { WORLD_AREAS_TABLE_NAME } from "#src/services/genshinAssets/shared/constants";
import { readCatalogueRegions } from "#src/services/genshinAssets/shared/readCatalogueRegions";
import { readExcelTable } from "#src/services/genshinText/readExcelTable";
import { readTextMap } from "#src/services/genshinText/readTextMap";
import { GameLanguage } from "genshin-text";

// Each of the open world's level-one areas by its id in the game's area table, with the catalogue area of its English name
// And the region holding it, which a scene point's own area is filed under
export const readCatalogueAreaPlaceMap = async (): Promise<Map<number, { areaId: string; region: string }>> =>
  toCatalogueAreaPlaceMap({
    areas: readExcelTable<WorldArea>(WORLD_AREAS_TABLE_NAME),
    regions: await readCatalogueRegions(),
    textMap: readTextMap(GameLanguage.English),
  });
