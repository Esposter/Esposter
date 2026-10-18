import type { ExcelRewardRow } from "#src/models/genshinAssets/rewards/ExcelRewardRow";
import type { DroppedItem } from "genshin-world";

import { toRewardItems } from "#src/services/genshinAssets/rewards/toRewardItems";
import { InvalidOperationError, Operation } from "@esposter/shared";

// The items one reward id pays, read off its row of the game's reward table as a claim gives them. A reward the table does
// Not hold is refused rather than paid as nothing
export const toRewardItemsById = (rewardId: number, rewardMap: ReadonlyMap<number, ExcelRewardRow>): DroppedItem[] => {
  const reward = rewardMap.get(rewardId);
  if (!reward)
    throw new InvalidOperationError(Operation.Read, String(rewardId), "names a reward the reward table does not hold");
  return toRewardItems(reward).map(({ itemCount, itemId }) => ({ count: itemCount, itemId }));
};
