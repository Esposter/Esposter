import type { ExcelOfferingLevelupRow } from "#src/models/genshinAssets/offerings/ExcelOfferingLevelupRow";
import type { OfferingLevelRow } from "#src/models/genshinAssets/offerings/OfferingLevelRow";
import type { ExcelRewardRow } from "#src/models/genshinAssets/rewards/ExcelRewardRow";

import { toRewardItems } from "#src/services/genshinAssets/rewards/toRewardItems";

// One offering level from its level-up row and the reward row it names: the item and count the level takes, none for a
// Level that names no item, and the reward's items with the empty slots dropped
export const toOfferingLevelRow = (
  { consumeItemConfigVec, level }: ExcelOfferingLevelupRow,
  rewardRow: ExcelRewardRow,
): OfferingLevelRow => {
  const consumedItem = consumeItemConfigVec.find(({ id }) => id !== undefined);
  return {
    itemCount: consumedItem?.count ?? 0,
    itemId: consumedItem?.id ?? 0,
    level,
    rewards: toRewardItems(rewardRow),
  };
};
