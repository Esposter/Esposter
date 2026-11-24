import type { ExcelDailyTaskRow } from "#src/models/genshinAssets/commissions/ExcelDailyTaskRow";
import type { Commission } from "genshin-world";

import { checkIsDailyTaskFinishKind } from "#src/services/genshinAssets/commissions/checkIsDailyTaskFinishKind";
import { checkIsDailyTaskTypeKind } from "#src/services/genshinAssets/commissions/checkIsDailyTaskTypeKind";
import {
  DAILY_FINISH_DEFAULT,
  DAILY_TASK_CENTER_POSITION_DEFAULT,
  DAILY_TASK_TYPE_DEFAULT,
  QUEST_TASK_FINISH_PROGRESS,
} from "#src/services/genshinAssets/commissions/constants";
import { DailyTaskFinishKindMap } from "#src/services/genshinAssets/commissions/DailyTaskFinishKindMap";
import { DailyTaskTypeKindMap } from "#src/services/genshinAssets/commissions/DailyTaskTypeKindMap";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { CommissionKind } from "genshin-world";

// One daily task of the dump as the world holds it, its quest as an id and none for a scene task, its title by its name
// Text id and the region it is preferred in. A type or finish the maps do not name is an error, since the task would be
// Dealt or finished wrongly
export const toCommissionTask = (row: ExcelDailyTaskRow, preferredRegion: string): Commission => {
  const {
    centerPosition = DAILY_TASK_CENTER_POSITION_DEFAULT,
    finishType = DAILY_FINISH_DEFAULT,
    type = DAILY_TASK_TYPE_DEFAULT,
  } = row;
  if (!checkIsDailyTaskTypeKind(type) || !checkIsDailyTaskFinishKind(finishType))
    throw new InvalidOperationError(
      Operation.Read,
      String(row.id),
      `has the type ${type} and the finish ${finishType}, which the maps do not name`,
    );
  const kind = DailyTaskTypeKindMap[type];
  return {
    centerPosition,
    enterDistance: row.enterDistance,
    exitDistance: row.exitDistance,
    finishKind: DailyTaskFinishKindMap[finishType],
    finishProgress: kind === CommissionKind.Quest ? QUEST_TASK_FINISH_PROGRESS : row.finishProgress,
    id: row.id,
    kind,
    nameTextId: String(row.titleTextMapHash),
    newGroupIds: row.newGroupVec,
    oldGroupIds: row.oldGroupVec,
    poolId: row.poolId,
    preferredRegion,
    questId: row.questId ? String(row.questId) : "",
    rewardTier: row.taskRewardId,
  };
};
