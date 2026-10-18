import type { ExcelRewardRow } from "#src/models/genshinAssets/rewards/ExcelRewardRow";

import { toRewardItems } from "#src/services/genshinAssets/rewards/toRewardItems";
import { InvalidOperationError, Operation } from "@esposter/shared";

// The items a quest's reward rows pay, in the rows' order, each as its item and how many of it. A row the reward table lacks
// Is an error, since the quest would pay less than the game does
export const toQuestRewardItems = (
  rewardIdList: number[],
  rewardMap: ReadonlyMap<number, ExcelRewardRow>,
): { count: number; itemId: number }[] =>
  rewardIdList.flatMap((rewardId) => {
    const reward = rewardMap.get(rewardId);
    if (!reward) throw new InvalidOperationError(Operation.Read, "reward table", `has no reward ${rewardId}`);
    return toRewardItems(reward).map(({ itemCount, itemId }) => ({ count: itemCount, itemId }));
  });
