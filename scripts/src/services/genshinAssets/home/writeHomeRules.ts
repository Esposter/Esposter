import type { ExcelComfortLevelRow } from "#src/models/genshinAssets/home/ExcelComfortLevelRow";
import type { ExcelFurnitureMakeRow } from "#src/models/genshinAssets/home/ExcelFurnitureMakeRow";
import type { ExcelHomeworldLevelRow } from "#src/models/genshinAssets/home/ExcelHomeworldLevelRow";
import type { MaterialRow } from "#src/models/genshinAssets/items/MaterialRow";

import { MATERIAL_TABLE_NAME } from "#src/services/genshinAssets/crafting/constants";
import {
  COMFORT_LEVEL_TABLE_NAME,
  FURNITURE_MAKE_TABLE_NAME,
  HOME_BLUEPRINTS_PATH,
  HOME_GENERATED_DIRECTORY,
  HOME_LEVELS_PATH,
  HOMEWORLD_LEVEL_TABLE_NAME,
  UNLOCK_FURNITURE_USE_OP,
} from "#src/services/genshinAssets/home/constants";
import { toHomeBlueprint } from "#src/services/genshinAssets/home/toHomeBlueprint";
import { readUnlockItemIdMap } from "#src/services/genshinAssets/items/readUnlockItemIdMap";
import { readExcelTable } from "#src/services/genshinAssets/stats/readExcelTable";
import { mkdirSync, writeFileSync } from "node:fs";

// The realm's rules from the game's tables, each written as a slice of the world's generated folder: the furnishings Tubby
// Makes, with the diagrams that open each, and the Trust and Adeptal Energy ranks. Each slice is sorted by its id or rank
export const writeHomeRules = (): void => {
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
  mkdirSync(HOME_GENERATED_DIRECTORY, { recursive: true });
  writeFileSync(HOME_BLUEPRINTS_PATH, `${JSON.stringify(blueprints)}\n`);
  writeFileSync(HOME_LEVELS_PATH, `${JSON.stringify({ comfort, trust })}\n`);
};
