import type { ExcelRewardRow } from "#src/models/genshinAssets/rewards/ExcelRewardRow";

import { toRewardIdItems } from "#src/services/genshinAssets/rewards/toRewardIdItems";
import { InvalidOperationError, Operation } from "@esposter/shared";

// The items a quest's reward rows pay, in the rows' order, each as its item and how many of it. A row the reward table lacks
// Is an error, since the quest would pay less than the game does
export const toQuestRewardItems = (
  rewardIdList: number[],
  rewardMap: ReadonlyMap<number, ExcelRewardRow>,
): { count: number; itemId: number }[] =>
  rewardIdList.flatMap((rewardId) => {
    const items = toRewardIdItems(rewardId, rewardMap);
    if (!items) throw new InvalidOperationError(Operation.Read, "reward table", `has no reward ${rewardId}`);
    return items;
  });
