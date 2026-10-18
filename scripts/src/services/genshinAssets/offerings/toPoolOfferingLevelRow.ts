import type { ExcelOfferingLevelupRow } from "#src/models/genshinAssets/offerings/ExcelOfferingLevelupRow";
import type { OfferingLevelRow } from "#src/models/genshinAssets/offerings/OfferingLevelRow";
import type { ExcelRewardRow } from "#src/models/genshinAssets/rewards/ExcelRewardRow";

import { toLevelItems } from "#src/services/genshinAssets/offerings/toLevelItems";
import { toRewardItems } from "#src/services/genshinAssets/rewards/toRewardItems";

// One offering level whose reward is drawn from a pool: every item the level takes, and every set of the pool, each set's
// Items with the empty slots dropped, so the world draws one set a level and pays each set once
export const toPoolOfferingLevelRow = (
  levelRow: ExcelOfferingLevelupRow,
  rewardRows: ExcelRewardRow[],
): OfferingLevelRow => ({
  items: toLevelItems(levelRow),
  level: levelRow.level,
  reward: { kind: "pool", sets: rewardRows.map((rewardRow) => toRewardItems(rewardRow)) },
});
