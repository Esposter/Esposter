import { AchievementCategory } from "#shared/models/achievement/AchievementCategory";

export const getCategoryColor = (category: AchievementCategory) => {
  switch (category) {
    case AchievementCategory.Clicker:
      return "amber";
    case AchievementCategory.Dungeons:
      return "deep-purple";
    case AchievementCategory.Email:
      return "light-blue";
    case AchievementCategory.Flowchart:
      return "lime";
    case AchievementCategory.Like:
      return "pink";
    case AchievementCategory.Message:
      return "blue";
    case AchievementCategory.Post:
      return "indigo";
    case AchievementCategory.Room:
      return "deep-orange";
    case AchievementCategory.Special:
      return "purple";
    case AchievementCategory.Survey:
      return "teal";
    case AchievementCategory.Table:
      return "cyan";
    case AchievementCategory.Webpage:
      return "light-green";
    default:
      return "grey";
  }
};
