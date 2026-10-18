import type { ExcelOfferingLevelupRow } from "#src/models/genshinAssets/offerings/ExcelOfferingLevelupRow";
import type { OfferingLevelReward, OfferingLevelRow } from "#src/models/genshinAssets/offerings/OfferingLevelRow";

import { toLevelItems } from "#src/services/genshinAssets/offerings/toLevelItems";

// One offering level from its level-up row and the reward it pays: every item the level takes, and the reward as given.
// A level that names no item takes none
export const toOfferingLevelRow = (
  levelRow: ExcelOfferingLevelupRow,
  reward: OfferingLevelReward,
): OfferingLevelRow => ({ items: toLevelItems(levelRow), level: levelRow.level, reward });
