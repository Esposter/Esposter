export const TableAchievementName = { DataAnalyst: "DataAnalyst", MathWhiz: "MathWhiz" } as const;
export type TableAchievementName = (typeof TableAchievementName)[keyof typeof TableAchievementName];
