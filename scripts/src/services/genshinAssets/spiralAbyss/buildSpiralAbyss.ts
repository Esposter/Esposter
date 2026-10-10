import type { ExcelTowerFloorRow } from "#src/models/genshinAssets/spiralAbyss/ExcelTowerFloorRow";
import type { ExcelTowerLevelRow } from "#src/models/genshinAssets/spiralAbyss/ExcelTowerLevelRow";
import type { ExcelTowerRewardRow } from "#src/models/genshinAssets/spiralAbyss/ExcelTowerRewardRow";
import type { ExcelTowerScheduleRow } from "#src/models/genshinAssets/spiralAbyss/ExcelTowerScheduleRow";

import {
  TOWER_FLOOR_TABLE_NAME,
  TOWER_LEVEL_TABLE_NAME,
  TOWER_REWARD_TABLE_NAME,
  TOWER_SCHEDULE_TABLE_NAME,
} from "#src/services/genshinAssets/spiralAbyss/constants";
import { toAbyssFloor } from "#src/services/genshinAssets/spiralAbyss/toAbyssFloor";
import { toAbyssFloorReward } from "#src/services/genshinAssets/spiralAbyss/toAbyssFloorReward";
import { toAbyssPeriod } from "#src/services/genshinAssets/spiralAbyss/toAbyssPeriod";
import { readExcelTable } from "#src/services/genshinAssets/stats/readExcelTable";
import { GameDataset } from "genshin-world";

// The Spiral Abyss's floors with their chambers, every floor's rewards in every reward group and the Moon Spire's periods,
// Each published as a record of the Spiral Abyss dataset. The floors record is every floor the tower table holds, the
// Corridor's eight and each period's four among them
export const buildSpiralAbyss = (): Record<string, unknown> => {
  const levelRows = readExcelTable<ExcelTowerLevelRow>(TOWER_LEVEL_TABLE_NAME);
  const floors = readExcelTable<ExcelTowerFloorRow>(TOWER_FLOOR_TABLE_NAME)
    .map((row) =>
      toAbyssFloor(
        row,
        levelRows.filter(({ levelGroupId }) => levelGroupId === row.levelGroupId),
      ),
    )
    .toSorted((firstFloor, secondFloor) => firstFloor.id - secondFloor.id);
  const rewards = readExcelTable<ExcelTowerRewardRow>(TOWER_REWARD_TABLE_NAME)
    .map((row) => toAbyssFloorReward(row))
    .toSorted(
      (firstReward, secondReward) =>
        firstReward.rewardGroup - secondReward.rewardGroup || firstReward.floorIndex - secondReward.floorIndex,
    );
  const periods = readExcelTable<ExcelTowerScheduleRow>(TOWER_SCHEDULE_TABLE_NAME)
    .map((row) => toAbyssPeriod(row))
    .toSorted((firstPeriod, secondPeriod) => firstPeriod.id - secondPeriod.id);
  return {
    [`${GameDataset.SpiralAbyss}/floors`]: floors,
    [`${GameDataset.SpiralAbyss}/periods`]: periods,
    [`${GameDataset.SpiralAbyss}/rewards`]: rewards,
  };
};
