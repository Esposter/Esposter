import type { ExcelDailyTaskRow } from "#src/models/genshinAssets/commissions/ExcelDailyTaskRow";
import type { Commission } from "genshin-world";

import { DailyTaskFinishKindMap } from "#src/services/genshinAssets/commissions/DailyTaskFinishKindMap";
import { DailyTaskTypeKindMap } from "#src/services/genshinAssets/commissions/DailyTaskTypeKindMap";
import { InvalidOperationError, Operation } from "@esposter/shared";

// One daily task of the dump as the world holds it, its quest as an id and none for a scene task. A type or finish the maps
// Do not name is an error, since the task would be dealt or finished wrongly
export const toCommissionTask = (row: ExcelDailyTaskRow): Commission => {
  const kind = DailyTaskTypeKindMap[row.type];
  const finishKind = DailyTaskFinishKindMap[row.finishType];
  if (!kind || !finishKind)
    throw new InvalidOperationError(
      Operation.Read,
      String(row.id),
      `has the type ${row.type} and the finish ${row.finishType}, which the maps do not name`,
    );
  return {
    centerPosition: row.centerPosition,
    enterDistance: row.enterDistance,
    exitDistance: row.exitDistance,
    finishKind,
    finishProgress: row.finishProgress,
    id: row.id,
    kind,
    newGroupIds: row.newGroupVec,
    oldGroupIds: row.oldGroupVec,
    poolId: row.poolId,
    questId: row.questId ? String(row.questId) : "",
    rewardTier: row.taskRewardId,
  };
};
