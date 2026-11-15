export const AchievementSort = { Category: "Category", RarestFirst: "Rarest first" } as const;
export type AchievementSort = (typeof AchievementSort)[keyof typeof AchievementSort];

export const AchievementSorts: ReadonlySet<AchievementSort> = new Set(Object.values(AchievementSort));
