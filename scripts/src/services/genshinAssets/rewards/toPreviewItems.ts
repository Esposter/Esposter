import type { ExcelRewardPreviewRow } from "#src/models/genshinAssets/expeditions/ExcelRewardPreviewRow";
import type { RewardItem } from "genshin-world";

import { parseRewardCount } from "#src/services/genshinAssets/expeditions/parseRewardCount";

// A reward preview's items as the world reads them, each with the least and most of it a claim may draw. An empty slot is
// Left out, and so is an item whose count is zero, since it can never pay
export const toPreviewItems = ({ previewItems }: ExcelRewardPreviewRow): RewardItem[] =>
  previewItems
    .filter(({ id }) => id !== 0)
    .map(({ count, id }) => {
      const { maxCount, minCount } = parseRewardCount(count);
      return { itemId: id, maxCount, minCount };
    })
    .filter(({ maxCount }) => maxCount > 0);
