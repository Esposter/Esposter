import type { ExcelAchievementGoalRow } from "#src/models/genshinAssets/achievements/ExcelAchievementGoalRow";
import type { ExcelRewardRow } from "#src/models/genshinAssets/rewards/ExcelRewardRow";
import type { AchievementCategory } from "genshin-world";

import { toRewardItems } from "#src/services/genshinAssets/rewards/toRewardItems";
import { InvalidOperationError, Operation } from "@esposter/shared";

// One category from its row. A category whose completion pays a reward pays its namecard, the reward's one item, and a
// Category with no end has no reward and an item of zero
export const toAchievementCategory = (
  row: ExcelAchievementGoalRow,
  rewardMap: ReadonlyMap<number, ExcelRewardRow>,
): AchievementCategory => {
  let namecardItemId = 0;
  if (row.finishRewardId !== 0) {
    const reward = rewardMap.get(row.finishRewardId);
    if (!reward)
      throw new InvalidOperationError(Operation.Read, String(row.id), `pays the missing reward ${row.finishRewardId}`);
    namecardItemId = toRewardItems(reward)[0]?.itemId ?? 0;
  }
  return { id: row.id, namecardItemId, nameTextId: String(row.nameTextMapHash), orderId: row.orderId };
};
