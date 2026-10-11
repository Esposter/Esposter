// @unocss-include
import { AchievementCategory } from "#shared/models/achievement/AchievementCategory";
import { defineAchievementDefinition } from "#shared/services/achievement/definitions/defineAchievementDefinition";
import { defineAchievementDefinitionMap } from "#shared/services/achievement/definitions/defineAchievementDefinitionMap";
import { PostAchievementName } from "@esposter/db-schema";
import { createCommentInputSchema } from "#shared/models/db/post/CreateCommentInput";
import { deleteCommentInputSchema } from "#shared/models/db/post/DeleteCommentInput";
import { updateCommentInputSchema } from "#shared/models/db/post/UpdateCommentInput";
import { createPostInputSchema } from "#shared/models/db/post/CreatePostInput";
import { deletePostInputSchema } from "#shared/models/db/post/DeletePostInput";
import { updatePostInputSchema } from "#shared/models/db/post/UpdatePostInput";
import { isAtLeast } from "#shared/services/achievement/conditions/isAtLeast";
import { isLessThan } from "#shared/services/achievement/conditions/isLessThan";
import { length } from "#shared/services/achievement/conditions/length";
import { property } from "#shared/services/achievement/conditions/property";

export const PostAchievementDefinitionMap = defineAchievementDefinitionMap(AchievementCategory.Post, {
  [PostAchievementName.BriefComment]: defineAchievementDefinition({
    amount: 50,
    condition: property("description", length(isLessThan(50))),
    description: "Create 50 comments under 50 characters",
    icon: "i-mdi:comment-flash",
    points: 40,
    inputSchema: createCommentInputSchema,
    triggerPath: "post.createComment",
  }),
  [PostAchievementName.Commentator]: defineAchievementDefinition({
    amount: 1,
    description: "Comment on a post",
    icon: "i-mdi:comment-plus",
    points: 10,
    inputSchema: createCommentInputSchema,
    triggerPath: "post.createComment",
  }),
  [PostAchievementName.CommentDeleter]: defineAchievementDefinition({
    amount: 1,
    description: "Delete a comment",
    icon: "i-mdi:comment-remove",
    points: 5,
    inputSchema: deleteCommentInputSchema,
    triggerPath: "post.deleteComment",
  }),
  [PostAchievementName.CommentEditor]: defineAchievementDefinition({
    amount: 1,
    description: "Edit a comment",
    icon: "i-mdi:comment-edit",
    points: 5,
    inputSchema: updateCommentInputSchema,
    triggerPath: "post.updateComment",
  }),
  [PostAchievementName.DetailedPost]: defineAchievementDefinition({
    amount: 1,
    condition: property("description", length(isAtLeast(1000))),
    description: "Create a post with 1000-4999 characters",
    icon: "i-mdi:text-box",
    points: 30,
    inputSchema: createPostInputSchema,
    triggerPath: "post.createPost",
  }),
  [PostAchievementName.Novelist]: defineAchievementDefinition({
    amount: 1,
    condition: property("description", length(isAtLeast(5000))),
    description: "Create a post with 5000+ characters",
    icon: "i-mdi:book-open-page-variant",
    points: 50,
    inputSchema: createPostInputSchema,
    triggerPath: "post.createPost",
  }),
  [PostAchievementName.PostDeleter]: defineAchievementDefinition({
    amount: 1,
    description: "Delete a post",
    icon: "i-mdi:delete-circle",
    points: 5,
    inputSchema: deletePostInputSchema,
    triggerPath: "post.deletePost",
  }),
  [PostAchievementName.PostEditor]: defineAchievementDefinition({
    amount: 1,
    description: "Edit a post",
    icon: "i-mdi:file-document-edit",
    points: 5,
    inputSchema: updatePostInputSchema,
    triggerPath: "post.updatePost",
  }),
  [PostAchievementName.PosterChild]: defineAchievementDefinition({
    amount: 1,
    description: "Create a post",
    icon: "i-mdi:post",
    points: 10,
    inputSchema: createPostInputSchema,
    triggerPath: "post.createPost",
  }),
  [PostAchievementName.ProlificPoster]: defineAchievementDefinition({
    amount: 25,
    description: "Create 25 posts",
    icon: "i-mdi:magnify",
    points: 35,
    inputSchema: createPostInputSchema,
    triggerPath: "post.createPost",
  }),
});
