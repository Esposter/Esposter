import { AchievementCategory } from "#shared/models/achievement/AchievementCategory";
import { AchievementConditionType } from "#shared/models/achievement/type/AchievementConditionType";
import { defineAchievementDefinition } from "#shared/services/achievement/defineAchievementDefinition";
import { BinaryOperator, LikeAchievementName } from "@esposter/db-schema";

export const LikeAchievementDefinitionMap = {
  [LikeAchievementName.Critic]: defineAchievementDefinition({
    amount: 10,
    category: AchievementCategory.Like,
    condition: {
      operator: BinaryOperator.eq,
      path: "value",
      type: AchievementConditionType.Property,
      value: -1,
    },
    description: "Dislike 10 posts",
    icon: "mdi-thumb-down",
    points: 15,
    triggerPath: "like.createLike" as const,
  }),
  [LikeAchievementName.CriticalThinker]: defineAchievementDefinition({
    amount: 50,
    category: AchievementCategory.Like,
    description: "Remove 50 likes",
    icon: "mdi-thumb-down-outline",
    points: 40,
    triggerPath: "like.deleteLike" as const,
  }),
  [LikeAchievementName.Disliker]: defineAchievementDefinition({
    amount: 1,
    category: AchievementCategory.Like,
    condition: {
      operator: BinaryOperator.eq,
      path: "value",
      type: AchievementConditionType.Property,
      value: -1,
    },
    description: "Dislike a post",
    icon: "mdi-thumb-down",
    points: 5,
    triggerPath: "like.createLike" as const,
  }),
  [LikeAchievementName.Hater]: defineAchievementDefinition({
    amount: 10,
    category: AchievementCategory.Like,
    description: "Unlike 10 posts",
    icon: "mdi-thumb-down",
    points: 15,
    triggerPath: "like.deleteLike" as const,
  }),
  [LikeAchievementName.Liker]: defineAchievementDefinition({
    amount: 1,
    category: AchievementCategory.Like,
    condition: {
      operator: BinaryOperator.eq,
      path: "value",
      type: AchievementConditionType.Property,
      value: 1,
    },
    description: "Like a post",
    icon: "mdi-thumb-up",
    points: 5,
    triggerPath: "like.createLike" as const,
  }),
  [LikeAchievementName.SuperFan]: defineAchievementDefinition({
    amount: 100,
    category: AchievementCategory.Like,
    condition: {
      operator: BinaryOperator.eq,
      path: "value",
      type: AchievementConditionType.Property,
      value: 1,
    },
    description: "Like 100 posts",
    icon: "mdi-heart-multiple",
    points: 75,
    triggerPath: "like.createLike" as const,
  }),
  [LikeAchievementName.Unliker]: defineAchievementDefinition({
    amount: 1,
    category: AchievementCategory.Like,
    description: "Unlike a post",
    icon: "mdi-thumb-down",
    points: 5,
    triggerPath: "like.deleteLike" as const,
  }),
};
