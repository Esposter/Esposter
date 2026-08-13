export enum AchievementView {
  Gallery = "Gallery",
  Leaderboard = "Leaderboard",
}

export const AchievementViews: ReadonlySet<AchievementView> = new Set(Object.values(AchievementView));
