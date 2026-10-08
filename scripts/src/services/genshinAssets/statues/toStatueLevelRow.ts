import type { ExcelCityLevelupRow } from "#src/models/genshinAssets/statues/ExcelCityLevelupRow";
import type { ExcelRewardRow } from "#src/models/genshinAssets/statues/ExcelRewardRow";
import type { StatueLevelRow } from "#src/models/genshinAssets/statues/StatueLevelRow";

const STAMINA_ACTION_TYPE = "WORLD_AREA_ACTION_IMPROVE_STAMINA";

// One level of a region's statues from its level-up row and the reward row it names: the Oculi it takes, the item they
// Are, the reward's items with the empty slots dropped, and the stamina its improve-stamina actions add
export const toStatueLevelRow = (
  { actionVec, consumeItem, level }: ExcelCityLevelupRow,
  { rewardItemList }: ExcelRewardRow,
): StatueLevelRow => ({
  level,
  oculusCount: consumeItem.EBHHDLDJNHI,
  oculusItemId: consumeItem.itemId,
  rewards: rewardItemList.filter(({ itemId }) => itemId !== 0).map(({ itemCount, itemId }) => ({ itemCount, itemId })),
  staminaShare: actionVec
    .filter(({ type }) => type === STAMINA_ACTION_TYPE)
    .reduce((total, { param1Vec }) => total + (param1Vec[0] ?? 0), 0),
});
