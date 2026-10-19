import type { ItemCount } from "#src/models/inventory/ItemCount";
import type { RewardItem } from "#src/models/reward/RewardItem";

import { drawChancedCount } from "#src/services/reward/drawChancedCount";
import { drawRangeCount } from "#src/services/reward/drawRangeCount";

// One item's count drawn by `random`. An item with an average is its least and one more for each unit between its least
// And most, each taken at the chance that makes the mean that average (PROVISIONAL: the wiki's average, a binomial over the
// Units). An item with none is drawn uniformly across its range
const drawItemCount = ({ averageCount, maxCount, minCount }: RewardItem, random: () => number): number =>
  averageCount === undefined
    ? drawRangeCount({ max: maxCount, min: minCount }, random)
    : drawChancedCount(
        {
          chance: (averageCount - minCount) / (maxCount - minCount),
          guaranteedCount: minCount,
          trials: maxCount - minCount,
        },
        random,
      );

// Each item of a reward drawn to a count by `random`, the items drawn to nothing left out
export const drawRewardItems = (items: RewardItem[], random: () => number): ItemCount[] =>
  items.map((item) => ({ count: drawItemCount(item, random), id: item.itemId })).filter(({ count }) => count > 0);
