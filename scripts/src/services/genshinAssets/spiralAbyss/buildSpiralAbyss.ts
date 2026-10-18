import type { MonsterRow } from "#src/models/genshinAssets/enemies/MonsterRow";
import type { ExcelTowerBuffRow } from "#src/models/genshinAssets/spiralAbyss/ExcelTowerBuffRow";
import type { ExcelTowerFloorRow } from "#src/models/genshinAssets/spiralAbyss/ExcelTowerFloorRow";
import type { ExcelTowerLevelRow } from "#src/models/genshinAssets/spiralAbyss/ExcelTowerLevelRow";
import type { ExcelTowerRewardRow } from "#src/models/genshinAssets/spiralAbyss/ExcelTowerRewardRow";
import type { ExcelTowerScheduleRow } from "#src/models/genshinAssets/spiralAbyss/ExcelTowerScheduleRow";

import { MONSTER_TABLE_NAME } from "#src/services/genshinAssets/enemies/constants";
import { readRewardMap } from "#src/services/genshinAssets/rewards/readRewardMap";
import {
  TOWER_BUFF_TABLE_NAME,
  TOWER_FLOOR_TABLE_NAME,
  TOWER_LEVEL_TABLE_NAME,
  TOWER_REWARD_TABLE_NAME,
  TOWER_SCHEDULE_TABLE_NAME,
} from "#src/services/genshinAssets/spiralAbyss/constants";
import { readPlacedEnemyKindIds } from "#src/services/genshinAssets/spiralAbyss/readPlacedEnemyKindIds";
import { toAbyssBenedictionChoices } from "#src/services/genshinAssets/spiralAbyss/toAbyssBenedictionChoices";
import { toAbyssEnemyKinds } from "#src/services/genshinAssets/spiralAbyss/toAbyssEnemyKinds";
import { toAbyssFloor } from "#src/services/genshinAssets/spiralAbyss/toAbyssFloor";
import { toAbyssFloorReward } from "#src/services/genshinAssets/spiralAbyss/toAbyssFloorReward";
import { toAbyssPeriod } from "#src/services/genshinAssets/spiralAbyss/toAbyssPeriod";
import { toAbyssRewardItems } from "#src/services/genshinAssets/spiralAbyss/toAbyssRewardItems";
import { readExcelTable } from "#src/services/genshinText/readExcelTable";
import { GameDataset } from "genshin-world";

// The Spiral Abyss's floors with their chambers, its rewards, the Moon Spire's periods and the Benedictions each chamber offers,
// Each published as a record of the Spiral Abyss dataset. The floors record is every floor the tower table holds, the Corridor's
// Eight and each period's four among them. The rewards record holds every floor's rewards in every reward group, and the items
// Each reward id they name pays, keyed by the reward id, so a claim gives items without reading the reward table. A period
// Carries its blessing and the moment it closes, and the Benediction choices record holds the three lists of each chamber's
// Level row, each choice joined to its description's text hash, keyed by its level id. The enemy kinds record names, for each
// Monster describe a chamber lists that the regions place exactly one monster of, the kind it is fought as
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
  const abyssDescribeIds = floors.flatMap(({ chambers }) =>
    chambers.flatMap(({ halfMonsterDescribeIds }) => halfMonsterDescribeIds.flat()),
  );
  const floorRewards = readExcelTable<ExcelTowerRewardRow>(TOWER_REWARD_TABLE_NAME)
    .map((row) => toAbyssFloorReward(row))
    .toSorted(
      (firstReward, secondReward) =>
        firstReward.rewardGroup - secondReward.rewardGroup || firstReward.floorIndex - secondReward.floorIndex,
    );
  const rewardMap = readRewardMap();
  const rewardIds = new Set(
    floorRewards.flatMap(({ chamberRewardIds, nineStarRewardId, sixStarRewardId, threeStarRewardId }) => [
      ...chamberRewardIds,
      threeStarRewardId,
      sixStarRewardId,
      nineStarRewardId,
    ]),
  );
  const periods = readExcelTable<ExcelTowerScheduleRow>(TOWER_SCHEDULE_TABLE_NAME)
    .map((row) => toAbyssPeriod(row))
    .toSorted((firstPeriod, secondPeriod) => firstPeriod.id - secondPeriod.id);
  const descriptionTextHashes = new Map(
    readExcelTable<ExcelTowerBuffRow>(TOWER_BUFF_TABLE_NAME).map(
      ({ descTextMapHash, towerBuffId }): [number, number] => [towerBuffId, descTextMapHash],
    ),
  );
  const benedictionChoices = Object.fromEntries(
    levelRows.map(({ levelId, towerBuffConfigStrList }) => [
      levelId,
      toAbyssBenedictionChoices(levelId, towerBuffConfigStrList, descriptionTextHashes),
    ]),
  );
  return {
    [`${GameDataset.SpiralAbyss}/benedictionChoices`]: benedictionChoices,
    [`${GameDataset.SpiralAbyss}/enemyKinds`]: toAbyssEnemyKinds(
      abyssDescribeIds,
      readExcelTable<MonsterRow>(MONSTER_TABLE_NAME),
      readPlacedEnemyKindIds(),
    ),
    [`${GameDataset.SpiralAbyss}/floors`]: floors,
    [`${GameDataset.SpiralAbyss}/periods`]: periods,
    [`${GameDataset.SpiralAbyss}/rewards`]: {
      floorRewards,
      rewardItems: Object.fromEntries(
        Array.from(rewardIds, (rewardId) => [rewardId, toAbyssRewardItems(rewardId, rewardMap)]),
      ),
    },
  };
};
