export const LikeAchievementName = {
  Critic: "Critic",
  CriticalThinker: "CriticalThinker",
  Disliker: "Disliker",
  Hater: "Hater",
  Liker: "Liker",
  SuperFan: "SuperFan",
  Unliker: "Unliker",
} as const;
export type LikeAchievementName = (typeof LikeAchievementName)[keyof typeof LikeAchievementName];
