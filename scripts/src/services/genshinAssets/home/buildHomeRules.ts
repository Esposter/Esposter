import type { ExcelComfortLevelRow } from "#src/models/genshinAssets/home/ExcelComfortLevelRow";
import type { ExcelFurnitureMakeRow } from "#src/models/genshinAssets/home/ExcelFurnitureMakeRow";
import type { ExcelHomeworldLevelRow } from "#src/models/genshinAssets/home/ExcelHomeworldLevelRow";
import type { MaterialRow } from "#src/models/genshinAssets/items/MaterialRow";

import { MATERIAL_TABLE_NAME } from "#src/services/genshinAssets/crafting/constants";
import {
  COMFORT_LEVEL_TABLE_NAME,
  FURNITURE_MAKE_TABLE_NAME,
  HOMEWORLD_LEVEL_TABLE_NAME,
  UNLOCK_FURNITURE_USE_OP,
} from "#src/services/genshinAssets/home/constants";
import { toHomeBlueprint } from "#src/services/genshinAssets/home/toHomeBlueprint";
import { readUnlockItemIdMap } from "#src/services/genshinAssets/items/readUnlockItemIdMap";
import { readExcelTable } from "#src/services/genshinAssets/stats/readExcelTable";
import { GameDataset } from "genshin-world";

// The realm's rules from the game's tables, each published as a record of the home dataset: the furnishings Tubby makes,
// With the diagrams that open each, and the Trust and Adeptal Energy ranks. Each record is sorted by its id or rank
export const buildHomeRules = (): Record<string, unknown> => {
  const unlockItemIdMap = readUnlockItemIdMap(
    readExcelTable<MaterialRow>(MATERIAL_TABLE_NAME),
    UNLOCK_FURNITURE_USE_OP,
  );
  const blueprints = readExcelTable<ExcelFurnitureMakeRow>(FURNITURE_MAKE_TABLE_NAME)
    .map((row) => toHomeBlueprint(row, unlockItemIdMap.get(row.furnitureItemID) ?? []))
    .toSorted((firstBlueprint, secondBlueprint) => firstBlueprint.id - secondBlueprint.id);
  const trust = readExcelTable<ExcelHomeworldLevelRow>(HOMEWORLD_LEVEL_TABLE_NAME)
    .map(({ deployNpcCount, exp, homeCoinStoreLimit, homeFetterExpStoreLimit, level }) => ({
      bountyStoreLimit: homeFetterExpStoreLimit,
      coinStoreLimit: homeCoinStoreLimit,
      exp,
      level,
      npcCount: deployNpcCount,
    }))
    .toSorted((firstLevel, secondLevel) => firstLevel.level - secondLevel.level);
  const comfort = readExcelTable<ExcelComfortLevelRow>(COMFORT_LEVEL_TABLE_NAME)
    .map(({ comfort: threshold, companionshipExpProduceRate, homeCoinProduceRate, levelID }) => ({
      bountyRate: companionshipExpProduceRate,
      coinRate: homeCoinProduceRate,
      comfort: threshold,
      level: levelID,
    }))
    .toSorted((firstLevel, secondLevel) => firstLevel.level - secondLevel.level);
  return { [`${GameDataset.Home}/blueprints`]: blueprints, [`${GameDataset.Home}/levels`]: { comfort, trust } };
};
