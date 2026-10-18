import type { ExcelRewardRow } from "#src/models/genshinAssets/rewards/ExcelRewardRow";
import type { DroppedItem } from "genshin-world";

import { toRewardItems } from "#src/services/genshinAssets/rewards/toRewardItems";

// The items one reward id pays, each as its item and how many of it, or undefined where the reward table holds no row
// For the id, which each caller refuses in its own words
export const toRewardIdItems = (
  rewardId: number,
  rewardMap: ReadonlyMap<number, ExcelRewardRow>,
): DroppedItem[] | undefined => {
  const reward = rewardMap.get(rewardId);
  return reward === undefined
    ? undefined
    : toRewardItems(reward).map(({ itemCount, itemId }) => ({ count: itemCount, itemId }));
};
