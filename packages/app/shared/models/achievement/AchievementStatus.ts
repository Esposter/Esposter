export enum AchievementStatus {
  All = "All",
  Locked = "Locked",
  Unlocked = "Unlocked",
}

export const AchievementStatuses: ReadonlySet<AchievementStatus> = new Set(Object.values(AchievementStatus));
