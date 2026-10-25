import type { ExcelCurrencyRewardRow } from "#src/models/genshinAssets/transPoints/ExcelCurrencyRewardRow";
import type { ExcelTransPointRewardRow } from "#src/models/genshinAssets/transPoints/ExcelTransPointRewardRow";

import { readReward } from "#src/services/genshinAssets/rewards/readReward";
import { OPEN_WORLD_SCENE_ID } from "#src/services/genshinAssets/shared/constants";
import { toTransPointRewardRow } from "#src/services/genshinAssets/transPoints/toTransPointRewardRow";
import { readExcelTable } from "#src/services/genshinText/readExcelTable";
import { GameDataset } from "genshin-world";

// The open world's transport point rewards, each point's Adventure EXP and Primogems joined from its reward row, published
// As one record of the transport points dataset, keyed by its scene. A point whose reward the reward table does not hold is
// An error, since a point paid nothing silently would be wrong
export const buildTransPointRewards = (): Record<string, unknown> => {
  const currencyRewardMap = new Map(
    readExcelTable<ExcelCurrencyRewardRow>("RewardExcelConfigData").map((reward) => [reward.rewardId, reward] as const),
  );
  const rewards = readExcelTable<ExcelTransPointRewardRow>("TransPointRewardConfigData")
    .filter(({ sceneId }) => sceneId === OPEN_WORLD_SCENE_ID)
    .map((row) => toTransPointRewardRow(row, readReward(currencyRewardMap, row.rewardId, `point ${row.pointId}`)))
    .toSorted((firstRow, secondRow) => firstRow.pointId - secondRow.pointId);
  return { [`${GameDataset.TransPoints}/scene${OPEN_WORLD_SCENE_ID}`]: rewards };
};
