import { AchievementCategory } from "#shared/models/achievement/AchievementCategory";

export const getCategoryColor = (category: AchievementCategory) => {
  switch (category) {
    case AchievementCategory.Messaging:
      return "blue";
    case AchievementCategory.Milestone:
      return "orange";
    case AchievementCategory.Social:
      return "purple";
    case AchievementCategory.Special:
      return "pink";
    default:
      return "grey";
  }
};
