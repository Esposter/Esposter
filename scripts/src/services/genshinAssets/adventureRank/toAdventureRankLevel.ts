import type { ExcelRewardRow } from "#src/models/genshinAssets/rewards/ExcelRewardRow";
import type { ExcelPlayerLevelRow } from "#src/models/genshinAssets/shared/ExcelPlayerLevelRow";
import type { AdventureRankLevel } from "genshin-world";

import { toQuestRewardItems } from "#src/services/genshinText/toQuestRewardItems";

// A rank of the player level table with the items its reward pays, which Katheryne gives once the rank is reached
export const toAdventureRankLevel = (
  { exp, level, rewardId }: ExcelPlayerLevelRow,
  rewardMap: ReadonlyMap<number, ExcelRewardRow>,
): AdventureRankLevel => ({ exp, level, rewardItems: rewardId ? toQuestRewardItems([rewardId], rewardMap) : [] });
