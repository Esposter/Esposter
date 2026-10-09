import type { ExcelCurrencyRewardRow } from "#src/models/genshinAssets/transPoints/ExcelCurrencyRewardRow";
import type { ExcelTransPointRewardRow } from "#src/models/genshinAssets/transPoints/ExcelTransPointRewardRow";

import { readExcelTable } from "#src/services/genshinAssets/stats/readExcelTable";
import { OPEN_WORLD_SCENE_ID, TRANS_POINT_REWARDS_PATH } from "#src/services/genshinAssets/transPoints/constants";
import { toTransPointRewardRow } from "#src/services/genshinAssets/transPoints/toTransPointRewardRow";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

// The open world's transport point rewards, each point's Adventure EXP and Primogems joined from its reward row, written
// As one slice in the world's generated folder. A point whose reward the reward table does not hold is an error, since a
// Point paid nothing silently would be wrong
export const writeTransPointRewards = (): void => {
  const currencyRewardMap = new Map(
    readExcelTable<ExcelCurrencyRewardRow>("RewardExcelConfigData").map((reward) => [reward.rewardId, reward] as const),
  );
  const rewards = readExcelTable<ExcelTransPointRewardRow>("TransPointRewardConfigData")
    .filter(({ sceneId }) => sceneId === OPEN_WORLD_SCENE_ID)
    .map((row) => {
      const currencyReward = currencyRewardMap.get(row.rewardId);
      if (!currencyReward)
        throw new InvalidOperationError(
          Operation.Read,
          "transport point",
          `point ${row.pointId} names reward ${row.rewardId}, which the reward table does not hold`,
        );
      return toTransPointRewardRow(row, currencyReward);
    })
    .toSorted((firstRow, secondRow) => firstRow.pointId - secondRow.pointId);
  mkdirSync(dirname(TRANS_POINT_REWARDS_PATH), { recursive: true });
  writeFileSync(TRANS_POINT_REWARDS_PATH, `${JSON.stringify(rewards, undefined, 2)}\n`);
};
