export const AchievementStatus = { All: "All", Locked: "Locked", Unlocked: "Unlocked" } as const;
export type AchievementStatus = (typeof AchievementStatus)[keyof typeof AchievementStatus];

export const AchievementStatuses: ReadonlySet<AchievementStatus> = new Set(Object.values(AchievementStatus));
