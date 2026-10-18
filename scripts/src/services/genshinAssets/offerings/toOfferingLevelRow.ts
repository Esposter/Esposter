import type { ExcelOfferingLevelupRow } from "#src/models/genshinAssets/offerings/ExcelOfferingLevelupRow";
import type { OfferingLevelRow } from "#src/models/genshinAssets/offerings/OfferingLevelRow";
import type { ExcelRewardRow } from "#src/models/genshinAssets/rewards/ExcelRewardRow";

import { getConsumedItems } from "#src/services/genshinAssets/offerings/getConsumedItems";
import { toRewardItems } from "#src/services/genshinAssets/rewards/toRewardItems";

// One offering level from its level-up row and the reward row it names: every item the level takes, in the slots the dump
// Names them, and the reward's items with the empty slots dropped. A level that names no item takes none
export const toOfferingLevelRow = (levelRow: ExcelOfferingLevelupRow, rewardRow: ExcelRewardRow): OfferingLevelRow => ({
  items: getConsumedItems(levelRow).map(({ count, id }) => ({ itemCount: count ?? 0, itemId: id ?? 0 })),
  level: levelRow.level,
  rewards: toRewardItems(rewardRow),
});
