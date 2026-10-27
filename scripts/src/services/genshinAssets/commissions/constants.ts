import { DailyTaskFinishKind } from "#src/models/genshinAssets/commissions/DailyTaskFinishKind";
import { DailyTaskTypeKind } from "#src/models/genshinAssets/commissions/DailyTaskTypeKind";

// The dump leaves a task's type out when it is the quest type, the enum's first value, so a task with no type is a quest
export const DAILY_TASK_TYPE_DEFAULT: DailyTaskTypeKind = DailyTaskTypeKind.DailyTaskQuest;
// The dump leaves a task's finish out when it is none, the enum's first value, so a task with no finish has none
export const DAILY_FINISH_DEFAULT: DailyTaskFinishKind = DailyTaskFinishKind.DailyFinishNone;
// The dump leaves a task's center position out when it is empty, so a task with no center position has the empty one
export const DAILY_TASK_CENTER_POSITION_DEFAULT = "";
// A quest task's finish count is its quest's one completion, since the dump leaves most quest tasks' count at zero
export const QUEST_TASK_FINISH_PROGRESS = 1;
