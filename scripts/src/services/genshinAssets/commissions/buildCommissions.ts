import type { ExcelDailyTaskLevelRow } from "#src/models/genshinAssets/commissions/ExcelDailyTaskLevelRow";
import type { ExcelDailyTaskRewardRow } from "#src/models/genshinAssets/commissions/ExcelDailyTaskRewardRow";
import type { ExcelDailyTaskRow } from "#src/models/genshinAssets/commissions/ExcelDailyTaskRow";
import type { ExcelRewardPreviewRow } from "#src/models/genshinAssets/expeditions/ExcelRewardPreviewRow";
import type { RewardItem } from "genshin-world";

import { toCommissionTask } from "#src/services/genshinAssets/commissions/toCommissionTask";
import { CityIdRegionMap } from "#src/services/genshinAssets/fishing/constants";
import { toPreviewItems } from "#src/services/genshinAssets/rewards/toPreviewItems";
import { readExcelTable } from "#src/services/genshinText/readExcelTable";
import { InvalidOperationError, Operation } from "@esposter/shared";
import {
  COMMISSION_RANK_BAND_COUNT,
  COMMISSION_RANK_BAND_SIZE,
  commissionSliceSchema,
  GameDataset,
} from "genshin-world";

// The level table must be the game's bands: twelve of five ranks each in order from rank one, since a claim reads its band
// Off the rank alone and a table of other bands would pay every rank the wrong reward
const checkLevelBands = (levelRows: ExcelDailyTaskLevelRow[]): void => {
  const isGameBands =
    levelRows.length === COMMISSION_RANK_BAND_COUNT &&
    levelRows.every(
      ({ ID, maxPlayerLevel, minPlayerLevel }, index) =>
        ID === index + 1 &&
        minPlayerLevel === index * COMMISSION_RANK_BAND_SIZE + 1 &&
        maxPlayerLevel === (index + 1) * COMMISSION_RANK_BAND_SIZE,
    );
  if (!isGameBands)
    throw new InvalidOperationError(
      Operation.Read,
      "DailyTaskLevelExcelConfigData",
      "is not the game's twelve bands of five ranks from rank one",
    );
};

// Every region's daily tasks from the dump: each task, every reward tier's items by Adventure Rank band, and the items of
// Katheryne's bonus by band, which each region's record shares. Every preview is read through the reward table, and each
// Band's items are the preview's items with a count drawn from its range, so the world's claim draws them. Published as
// One record a region, each task filed under the region its city is named for, and a city no region is named for left out
export const buildCommissions = (): Record<string, unknown> => {
  const previews = new Map(
    readExcelTable<ExcelRewardPreviewRow>("RewardPreviewExcelConfigData").map((preview) => [preview.id, preview]),
  );
  const toBandItems = (previewId: number, owner: string): RewardItem[] => {
    const preview = previews.get(previewId);
    if (!preview)
      throw new InvalidOperationError(
        Operation.Read,
        owner,
        `names reward preview ${previewId}, which the table does not hold`,
      );
    return toPreviewItems(preview);
  };
  const levelRows = readExcelTable<ExcelDailyTaskLevelRow>("DailyTaskLevelExcelConfigData").toSorted(
    (firstRow, secondRow) => firstRow.ID - secondRow.ID,
  );
  checkLevelBands(levelRows);
  const bonuses = levelRows.map(({ ID, scorePreviewRewardId }) =>
    toBandItems(scorePreviewRewardId, `Katheryne's bonus band ${ID}`),
  );
  const rewardTiers = readExcelTable<ExcelDailyTaskRewardRow>("DailyTaskRewardExcelConfigData")
    .map(({ dropVec, ID }) => {
      if (dropVec.length !== COMMISSION_RANK_BAND_COUNT)
        throw new InvalidOperationError(
          Operation.Read,
          `reward tier ${ID}`,
          `has ${dropVec.length} bands, not ${COMMISSION_RANK_BAND_COUNT}`,
        );
      return {
        bands: dropVec.map(({ previewRewardId }) => toBandItems(previewRewardId, `reward tier ${ID}`)),
        tier: ID,
      };
    })
    .toSorted((firstTier, secondTier) => firstTier.tier - secondTier.tier);
  const rows = readExcelTable<ExcelDailyTaskRow>("DailyTaskExcelConfigData");
  return Object.fromEntries(
    Object.values(CityIdRegionMap).map((region) => {
      const tasks = rows
        .filter((row) => CityIdRegionMap[row.cityId] === region)
        .map((row) => toCommissionTask(row, region))
        .toSorted((firstTask, secondTask) => firstTask.id - secondTask.id);
      return [`${GameDataset.Commissions}/${region}`, commissionSliceSchema.parse({ bonuses, rewardTiers, tasks })];
    }),
  );
};
