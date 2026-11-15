export const DailyTaskTypeKind = { DailyTaskQuest: "DAILY_TASK_QUEST", DailyTaskScene: "DAILY_TASK_SCENE" } as const;
export type DailyTaskTypeKind = (typeof DailyTaskTypeKind)[keyof typeof DailyTaskTypeKind];
