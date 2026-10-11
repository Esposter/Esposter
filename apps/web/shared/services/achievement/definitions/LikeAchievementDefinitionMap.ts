// @unocss-include
import { AchievementCategory } from "#shared/models/achievement/AchievementCategory";
import { createLikeInputSchema } from "#shared/models/db/post/CreateLikeInput";
import { deleteLikeInputSchema } from "#shared/models/db/post/DeleteLikeInput";
import { equals } from "#shared/services/achievement/conditions/equals";
import { property } from "#shared/services/achievement/conditions/property";
import { defineAchievementDefinition } from "#shared/services/achievement/definitions/defineAchievementDefinition";
import { defineAchievementDefinitionMap } from "#shared/services/achievement/definitions/defineAchievementDefinitionMap";
import { LikeAchievementName } from "@esposter/db-schema";

export const LikeAchievementDefinitionMap = defineAchievementDefinitionMap(AchievementCategory.Like, {
  [LikeAchievementName.Critic]: defineAchievementDefinition({
    amount: 10,
    condition: property("value", equals(-1)),
    description: "Dislike 10 posts",
    icon: "i-mdi:thumb-down",
    inputSchema: createLikeInputSchema,
    points: 15,
    triggerPath: "like.createLike",
  }),
  [LikeAchievementName.CriticalThinker]: defineAchievementDefinition({
    amount: 50,
    description: "Remove 50 likes",
    icon: "i-mdi:thumb-down-outline",
    inputSchema: deleteLikeInputSchema,
    points: 40,
    triggerPath: "like.deleteLike",
  }),
  [LikeAchievementName.Disliker]: defineAchievementDefinition({
    amount: 1,
    condition: property("value", equals(-1)),
    description: "Dislike a post",
    icon: "i-mdi:thumb-down",
    inputSchema: createLikeInputSchema,
    points: 5,
    triggerPath: "like.createLike",
  }),
  [LikeAchievementName.Hater]: defineAchievementDefinition({
    amount: 10,
    description: "Unlike 10 posts",
    icon: "i-mdi:thumb-down",
    inputSchema: deleteLikeInputSchema,
    points: 15,
    triggerPath: "like.deleteLike",
  }),
  [LikeAchievementName.Liker]: defineAchievementDefinition({
    amount: 1,
    condition: property("value", equals(1)),
    description: "Like a post",
    icon: "i-mdi:thumb-up",
    inputSchema: createLikeInputSchema,
    points: 5,
    triggerPath: "like.createLike",
  }),
  [LikeAchievementName.SuperFan]: defineAchievementDefinition({
    amount: 100,
    condition: property("value", equals(1)),
    description: "Like 100 posts",
    icon: "i-mdi:heart-multiple",
    inputSchema: createLikeInputSchema,
    points: 75,
    triggerPath: "like.createLike",
  }),
  [LikeAchievementName.Unliker]: defineAchievementDefinition({
    amount: 1,
    description: "Unlike a post",
    icon: "i-mdi:thumb-down",
    inputSchema: deleteLikeInputSchema,
    points: 5,
    triggerPath: "like.deleteLike",
  }),
});
