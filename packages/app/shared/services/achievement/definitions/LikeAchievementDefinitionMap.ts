import { AchievementCategory } from "#shared/models/achievement/AchievementCategory";
import { defineAchievementDefinition } from "#shared/services/achievement/defineAchievementDefinition";
import { AchievementName } from "@esposter/db-schema";

export const LikeAchievementDefinitionMap = {
  [AchievementName.Liker]: defineAchievementDefinition({
    amount: 1,
    category: AchievementCategory.Like,
    description: "Like a post",
    icon: "mdi-thumb-up",
    points: 5,
    triggerPath: "like.createLike" as const,
  }),
  [AchievementName.SuperFan]: defineAchievementDefinition({
    amount: 100,
    category: AchievementCategory.Like,
    description: "Like 100 posts",
    icon: "mdi-heart-multiple",
    points: 75,
    triggerPath: "like.createLike" as const,
  }),
  [AchievementName.Unliker]: defineAchievementDefinition({
    amount: 1,
    category: AchievementCategory.Like,
    description: "Remove a like",
    icon: "mdi-thumb-down",
    points: 5,
    triggerPath: "like.deleteLike" as const,
  }),
};
