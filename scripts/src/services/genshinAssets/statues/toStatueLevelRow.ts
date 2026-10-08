import type { ExcelRewardRow } from "#src/models/genshinAssets/rewards/ExcelRewardRow";
import type { ExcelCityLevelupRow } from "#src/models/genshinAssets/statues/ExcelCityLevelupRow";
import type { StatueLevelRow } from "#src/models/genshinAssets/statues/StatueLevelRow";

import { toRewardItems } from "#src/services/genshinAssets/rewards/toRewardItems";

const STAMINA_ACTION_TYPE = "WORLD_AREA_ACTION_IMPROVE_STAMINA";

// One level of a region's statues from its level-up row and the reward row it names: the Oculi it takes and their item,
// The reward's items with the empty slots dropped, and the stamina its improve-stamina actions add
export const toStatueLevelRow = (
  { actionVec, consumeItem, level }: ExcelCityLevelupRow,
  rewardRow: ExcelRewardRow,
): StatueLevelRow => ({
  itemCount: consumeItem.EBHHDLDJNHI,
  itemId: consumeItem.itemId,
  level,
  rewards: toRewardItems(rewardRow),
  staminaShare: actionVec
    .filter(({ type }) => type === STAMINA_ACTION_TYPE)
    .reduce((total, { param1Vec }) => total + (param1Vec[0] ?? 0), 0),
});
