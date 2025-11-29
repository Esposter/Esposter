import { AchievementCategory } from "#shared/models/achievement/AchievementCategory";
import { defineAchievementDefinition } from "#shared/services/achievement/defineAchievementDefinition";
import { AchievementName } from "@esposter/db-schema";

export const PostAchievementDefinitionMap = {
  [AchievementName.Commentator]: defineAchievementDefinition({
    amount: 1,
    category: AchievementCategory.Post,
    description: "Comment on a post",
    icon: "mdi-comment-plus",
    points: 10,
    triggerPath: "post.createComment" as const,
  }),
  [AchievementName.CommentDeleter]: defineAchievementDefinition({
    amount: 1,
    category: AchievementCategory.Post,
    description: "Delete a comment",
    icon: "mdi-comment-remove",
    points: 5,
    triggerPath: "post.deleteComment" as const,
  }),
  [AchievementName.CommentEditor]: defineAchievementDefinition({
    amount: 1,
    category: AchievementCategory.Post,
    description: "Edit a comment",
    icon: "mdi-comment-edit",
    points: 5,
    triggerPath: "post.updateComment" as const,
  }),
  [AchievementName.PostDeleter]: defineAchievementDefinition({
    amount: 1,
    category: AchievementCategory.Post,
    description: "Delete a post",
    icon: "mdi-delete-circle",
    points: 5,
    triggerPath: "post.deletePost" as const,
  }),
  [AchievementName.PostEditor]: defineAchievementDefinition({
    amount: 1,
    category: AchievementCategory.Post,
    description: "Edit a post",
    icon: "mdi-file-document-edit",
    points: 5,
    triggerPath: "post.updatePost" as const,
  }),
  [AchievementName.PosterChild]: defineAchievementDefinition({
    amount: 1,
    category: AchievementCategory.Post,
    description: "Create a post",
    icon: "mdi-post",
    points: 10,
    triggerPath: "post.createPost" as const,
  }),
  [AchievementName.ProlificPoster]: defineAchievementDefinition({
    amount: 25,
    category: AchievementCategory.Post,
    description: "Create 25 posts",
    icon: "mdi-magnify",
    points: 35,
    triggerPath: "post.createPost" as const,
  }),
};
