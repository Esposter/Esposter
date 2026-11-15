export const AchievementView = { Gallery: "Gallery", Leaderboard: "Leaderboard" } as const;
export type AchievementView = (typeof AchievementView)[keyof typeof AchievementView];

export const AchievementViews: ReadonlySet<AchievementView> = new Set(Object.values(AchievementView));
