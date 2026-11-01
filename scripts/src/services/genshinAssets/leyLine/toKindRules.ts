import type { ExcelBlossomRefreshRow } from "#src/models/genshinAssets/leyLine/ExcelBlossomRefreshRow";
import type { ExcelRewardPreviewRow } from "#src/models/genshinAssets/shared/ExcelRewardPreviewRow";
import type { OutcropKindRule } from "genshin-world";

import {
  AREA_UNLOCK_CONDITION_TYPE,
  LeyLineRefreshKindMap,
  PLAYER_LEVEL_CONDITION_TYPE,
} from "#src/services/genshinAssets/leyLine/constants";
import { toWorldLevelRewards } from "#src/services/genshinAssets/leyLine/toWorldLevelRewards";
import { takeOne } from "@esposter/shared";

// The kind rules a blossom refresh row opens: one for a ley line kind, none for a refresh that is not one
export const toKindRules = (
  { KNHAALNEMLL, OFGHJMOLMNA, refreshType }: ExcelBlossomRefreshRow,
  rewardPreviews: ReadonlyMap<number, ExcelRewardPreviewRow>,
): OutcropKindRule[] => {
  const kind = LeyLineRefreshKindMap[refreshType];
  const playerLevelCondition = KNHAALNEMLL.find(({ type }) => type === PLAYER_LEVEL_CONDITION_TYPE);
  if (kind === undefined || playerLevelCondition === undefined) return [];
  return [
    {
      kind,
      playerLevel: takeOne(playerLevelCondition.param, 0),
      unlockCityIds: KNHAALNEMLL.filter(({ type }) => type === AREA_UNLOCK_CONDITION_TYPE).map(({ param }) =>
        takeOne(param, 0),
      ),
      worldLevelRewards: toWorldLevelRewards(OFGHJMOLMNA, refreshType, rewardPreviews),
    },
  ];
};
