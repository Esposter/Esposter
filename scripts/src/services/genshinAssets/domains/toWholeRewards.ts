import type { ExcelRewardPreviewRow } from "#src/models/genshinAssets/shared/ExcelRewardPreviewRow";
import type { RewardItem } from "genshin-world";

import { REWARD_COUNT_DEFAULT } from "#src/services/genshinAssets/rewards/constants";

// A level's whole rewards are the items its reward preview gives a whole number of, as Mora, Adventure EXP and Companionship
// EXP are. An item with no count, or with a count that is fractional or a range, is a drawn item, which its books, weapon
// Materials or artifacts give instead, so it is left out here. An empty slot has no count
export const toWholeRewards = (preview: ExcelRewardPreviewRow): RewardItem[] =>
  preview.previewItems.flatMap(({ count = REWARD_COUNT_DEFAULT, id }) => {
    const itemCount = Number(count);
    return Number.isInteger(itemCount) && itemCount > 0
      ? [{ itemId: id, maxCount: itemCount, minCount: itemCount }]
      : [];
  });
