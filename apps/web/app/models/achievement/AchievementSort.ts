export enum AchievementSort {
  Category = "Category",
  RarestFirst = "Rarest first",
}

export const AchievementSorts: ReadonlySet<AchievementSort> = new Set(Object.values(AchievementSort));
