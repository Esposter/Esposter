import { CommissionKind } from "genshin-world";

// Each daily task's type in the dump's table, as the world names its kind
export const DailyTaskTypeKindMap: Readonly<Record<string, CommissionKind>> = {
  DAILY_TASK_QUEST: CommissionKind.Quest,
  DAILY_TASK_SCENE: CommissionKind.Scene,
};
