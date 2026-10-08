import type { ExcelTowerFloorRow } from "#src/models/genshinAssets/spiralAbyss/ExcelTowerFloorRow";
import type { ExcelTowerLevelRow } from "#src/models/genshinAssets/spiralAbyss/ExcelTowerLevelRow";
import type { ExcelTowerRewardRow } from "#src/models/genshinAssets/spiralAbyss/ExcelTowerRewardRow";
import type { ExcelTowerScheduleRow } from "#src/models/genshinAssets/spiralAbyss/ExcelTowerScheduleRow";

import {
  SPIRAL_ABYSS_FLOORS_PATH,
  SPIRAL_ABYSS_GENERATED_DIRECTORY,
  SPIRAL_ABYSS_PERIODS_PATH,
  SPIRAL_ABYSS_REWARDS_PATH,
  TOWER_FLOOR_TABLE_NAME,
  TOWER_LEVEL_TABLE_NAME,
  TOWER_REWARD_TABLE_NAME,
  TOWER_SCHEDULE_TABLE_NAME,
} from "#src/services/genshinAssets/spiralAbyss/constants";
import { toAbyssFloor } from "#src/services/genshinAssets/spiralAbyss/toAbyssFloor";
import { toAbyssFloorReward } from "#src/services/genshinAssets/spiralAbyss/toAbyssFloorReward";
import { toAbyssPeriod } from "#src/services/genshinAssets/spiralAbyss/toAbyssPeriod";
import { readExcelTable } from "#src/services/genshinAssets/stats/readExcelTable";
import { mkdirSync, writeFileSync } from "node:fs";

// The Spiral Abyss's floors with their chambers, every floor's rewards in every reward group and the Moon Spire's periods,
// Each written as a slice in the world's generated folder. The floors slice is every floor the tower table holds, the
// Corridor's eight and each period's four among them
export const writeSpiralAbyss = (): void => {
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
  mkdirSync(SPIRAL_ABYSS_GENERATED_DIRECTORY, { recursive: true });
  writeFileSync(SPIRAL_ABYSS_FLOORS_PATH, `${JSON.stringify(floors)}\n`);
  writeFileSync(SPIRAL_ABYSS_REWARDS_PATH, `${JSON.stringify(rewards)}\n`);
  writeFileSync(SPIRAL_ABYSS_PERIODS_PATH, `${JSON.stringify(periods)}\n`);
};
