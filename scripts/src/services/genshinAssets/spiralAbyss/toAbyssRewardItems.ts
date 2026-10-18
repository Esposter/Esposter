import type { ExcelRewardRow } from "#src/models/genshinAssets/rewards/ExcelRewardRow";
import type { DroppedItem } from "genshin-world";

import { toRewardIdItems } from "#src/services/genshinAssets/rewards/toRewardIdItems";
import { InvalidOperationError, Operation } from "@esposter/shared";

// The items one reward id of a floor pays, read off its row of the game's reward table as a claim gives them. A reward the
// Table does not hold is refused rather than paid as nothing
export const toAbyssRewardItems = (rewardId: number, rewardMap: ReadonlyMap<number, ExcelRewardRow>): DroppedItem[] => {
  const items = toRewardIdItems(rewardId, rewardMap);
  if (!items)
    throw new InvalidOperationError(Operation.Read, String(rewardId), "names a reward the reward table does not hold");
  return items;
};
