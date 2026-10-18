import type { ExcelOfferingLevelupRow } from "#src/models/genshinAssets/offerings/ExcelOfferingLevelupRow";
import type { OfferingLevelRow } from "#src/models/genshinAssets/offerings/OfferingLevelRow";
import type { ExcelRewardRow } from "#src/models/genshinAssets/rewards/ExcelRewardRow";

import { toLevelItems } from "#src/services/genshinAssets/offerings/toLevelItems";
import { toRewardItems } from "#src/services/genshinAssets/rewards/toRewardItems";

// One offering level from its level-up row and the reward row it names: every item the level takes, and the reward's
// Items with the empty slots dropped as the level's fixed reward. A level that names no item takes none
export const toOfferingLevelRow = (levelRow: ExcelOfferingLevelupRow, rewardRow: ExcelRewardRow): OfferingLevelRow => ({
  items: toLevelItems(levelRow),
  level: levelRow.level,
  reward: { kind: "fixed", rewards: toRewardItems(rewardRow) },
});
