import { AchievementCategory } from "#shared/models/achievement/AchievementCategory";

export const CategoryColorMap = {
  [AchievementCategory.Clicker]: "amber",
  [AchievementCategory.Dungeons]: "deep-purple",
  [AchievementCategory.Email]: "light-blue",
  [AchievementCategory.Flowchart]: "lime",
  [AchievementCategory.Like]: "pink",
  [AchievementCategory.Message]: "blue",
  [AchievementCategory.Post]: "indigo",
  [AchievementCategory.Room]: "deep-orange",
  [AchievementCategory.Special]: "purple",
  [AchievementCategory.Survey]: "teal",
  [AchievementCategory.Table]: "cyan",
  [AchievementCategory.Webpage]: "light-green",
} as const satisfies Record<AchievementCategory, string>;
