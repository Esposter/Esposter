export enum AchievementStatus {
  All = "All",
  Locked = "Locked",
  Unlocked = "Unlocked",
}

export const AchievementStatuses = new Set(Object.values(AchievementStatus));
