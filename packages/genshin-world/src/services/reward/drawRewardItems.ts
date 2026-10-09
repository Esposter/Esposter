import type { ItemCount } from "#src/models/inventory/ItemCount";
import type { RewardItem } from "#src/models/reward/RewardItem";

// Each item of a reward drawn to a count in its range by `random`, the items drawn to nothing left out
export const drawRewardItems = (items: RewardItem[], random: () => number): ItemCount[] =>
  items
    .map(({ itemId, maxCount, minCount }) => ({
      count: minCount + Math.floor(random() * (maxCount - minCount + 1)),
      id: itemId,
    }))
    .filter(({ count }) => count > 0);
