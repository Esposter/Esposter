import type { ExcelDailyTaskLevelRow } from "#src/models/genshinAssets/commissions/ExcelDailyTaskLevelRow";
import type { ExcelDailyTaskRewardRow } from "#src/models/genshinAssets/commissions/ExcelDailyTaskRewardRow";
import type { ExcelDailyTaskRow } from "#src/models/genshinAssets/commissions/ExcelDailyTaskRow";
import type { ExcelRewardPreviewRow } from "#src/models/genshinAssets/expeditions/ExcelRewardPreviewRow";
import type { RewardItem } from "genshin-world";

import {
  COMMISSIONS_GENERATED_DIRECTORY,
  MONDSTADT_COMMISSIONS_PATH,
} from "#src/services/genshinAssets/commissions/constants";
import { toCommissionTask } from "#src/services/genshinAssets/commissions/toCommissionTask";
import { toPreviewItems } from "#src/services/genshinAssets/rewards/toPreviewItems";
import { readExcelTable } from "#src/services/genshinAssets/stats/readExcelTable";
import { MONDSTADT_CITY_ID } from "#src/services/genshinAssets/statues/constants";
import { writeJsonFile } from "#src/services/shared/writeJsonFile";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { COMMISSION_RANK_BAND_COUNT, COMMISSION_RANK_BAND_SIZE, commissionSliceSchema } from "genshin-world";
import { mkdirSync } from "node:fs";

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

// Mondstadt's daily tasks from the dump: each task, every reward tier's items by Adventure Rank band, and the items of
// Katheryne's bonus by band. Every preview is read through the reward table, and each band's items are the preview's
// Items with a count drawn from its range, so the world's claim draws them. Written as one slice in the world's folder
export const writeMondstadtCommissions = (): void => {
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
  const tasks = readExcelTable<ExcelDailyTaskRow>("DailyTaskExcelConfigData")
    .filter(({ cityId }) => cityId === MONDSTADT_CITY_ID)
    .map((row) => toCommissionTask(row))
    .toSorted((firstTask, secondTask) => firstTask.id - secondTask.id);
  const slice = commissionSliceSchema.parse({ bonuses, rewardTiers, tasks });
  mkdirSync(COMMISSIONS_GENERATED_DIRECTORY, { recursive: true });
  writeJsonFile(MONDSTADT_COMMISSIONS_PATH, slice);
};
