import type { ExcelAchievementRow } from "#src/models/genshinAssets/achievements/ExcelAchievementRow";
import type { ExcelRewardRow } from "#src/models/genshinAssets/rewards/ExcelRewardRow";
import type { Achievement } from "genshin-world";

import { HIDDEN_SHOW_TYPE, PRIMOGEM_ITEM_ID } from "#src/services/genshinAssets/achievements/constants";
import { InvalidOperationError, Operation } from "@esposter/shared";

// The table keeps a trigger's ids in its slots, each slot a list joined by commas or semicolons and empty when unused. Each
// Slot is split into its ids and kept in its place, since a trigger counts only the slot its kind watches
const toTriggerParameters = (paramList: string[]): string[][] =>
  paramList.map((slot) => slot.split(/[,;]/u).filter((id) => id !== ""));

// One achievement from its row and the reward row it pays, or undefined for an achievement the game no longer offers. The
// Reward's Primogems are the only item an achievement pays, so a row whose reward is missing from the table is refused
export const toAchievement = (
  row: ExcelAchievementRow,
  rewardMap: ReadonlyMap<number, ExcelRewardRow>,
): Achievement | undefined => {
  if (row.isDisuse) return undefined;
  const reward = rewardMap.get(row.finishRewardId);
  if (!reward)
    throw new InvalidOperationError(Operation.Read, String(row.id), `pays the missing reward ${row.finishRewardId}`);
  return {
    categoryId: row.goalId,
    descriptionTextId: String(row.descTextMapHash),
    id: row.id,
    isHidden: row.isShow === HIDDEN_SHOW_TYPE,
    orderId: row.orderId,
    preStageAchievementId: row.preStageAchievementId,
    primogems: reward.rewardItemList
      .filter(({ itemId }) => itemId === PRIMOGEM_ITEM_ID)
      .reduce((primogems, { itemCount }) => primogems + itemCount, 0),
    progress: row.progress,
    titleTextId: String(row.titleTextMapHash),
    trigger: { parameters: toTriggerParameters(row.triggerConfig.paramList), type: row.triggerConfig.triggerType },
  };
};
