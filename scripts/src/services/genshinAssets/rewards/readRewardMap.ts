import type { ExcelRewardRow } from "#src/models/genshinAssets/rewards/ExcelRewardRow";

import { readExcelTable } from "#src/services/genshinAssets/stats/readExcelTable";

// The game's reward table keyed by its reward id, which each level writer joins its level's reward through
export const readRewardMap = (): Map<number, ExcelRewardRow> =>
  new Map(readExcelTable<ExcelRewardRow>("RewardExcelConfigData").map((reward) => [reward.rewardId, reward]));
