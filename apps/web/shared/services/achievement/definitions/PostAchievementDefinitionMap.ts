// @unocss-include
import { AchievementCategory } from "#shared/models/achievement/AchievementCategory";
import { createCommentInputSchema } from "#shared/models/db/post/CreateCommentInput";
import { createPostInputSchema } from "#shared/models/db/post/CreatePostInput";
import { deleteCommentInputSchema } from "#shared/models/db/post/DeleteCommentInput";
import { deletePostInputSchema } from "#shared/models/db/post/DeletePostInput";
import { updateCommentInputSchema } from "#shared/models/db/post/UpdateCommentInput";
import { updatePostInputSchema } from "#shared/models/db/post/UpdatePostInput";
import { isAtLeast } from "#shared/services/achievement/conditions/isAtLeast";
import { isLessThan } from "#shared/services/achievement/conditions/isLessThan";
import { length } from "#shared/services/achievement/conditions/length";
import { property } from "#shared/services/achievement/conditions/property";
import { defineAchievementDefinition } from "#shared/services/achievement/definitions/defineAchievementDefinition";
import { defineAchievementDefinitionMap } from "#shared/services/achievement/definitions/defineAchievementDefinitionMap";
import { PostAchievementName } from "@esposter/db-schema";

export const PostAchievementDefinitionMap = defineAchievementDefinitionMap(AchievementCategory.Post, {
  [PostAchievementName.BriefComment]: defineAchievementDefinition({
    amount: 50,
    condition: property("description", length(isLessThan(50))),
    description: "Create 50 comments under 50 characters",
    icon: "i-mdi:comment-flash",
    inputSchema: createCommentInputSchema,
    points: 40,
    triggerPath: "post.createComment",
  }),
  [PostAchievementName.Commentator]: defineAchievementDefinition({
    amount: 1,
    description: "Comment on a post",
    icon: "i-mdi:comment-plus",
    inputSchema: createCommentInputSchema,
    points: 10,
    triggerPath: "post.createComment",
  }),
  [PostAchievementName.CommentDeleter]: defineAchievementDefinition({
    amount: 1,
    description: "Delete a comment",
    icon: "i-mdi:comment-remove",
    inputSchema: deleteCommentInputSchema,
    points: 5,
    triggerPath: "post.deleteComment",
  }),
  [PostAchievementName.CommentEditor]: defineAchievementDefinition({
    amount: 1,
    description: "Edit a comment",
    icon: "i-mdi:comment-edit",
    inputSchema: updateCommentInputSchema,
    points: 5,
    triggerPath: "post.updateComment",
  }),
  [PostAchievementName.DetailedPost]: defineAchievementDefinition({
    amount: 1,
    condition: property("description", length(isAtLeast(1000))),
    description: "Create a post with 1000-4999 characters",
    icon: "i-mdi:text-box",
    inputSchema: createPostInputSchema,
    points: 30,
    triggerPath: "post.createPost",
  }),
  [PostAchievementName.Novelist]: defineAchievementDefinition({
    amount: 1,
    condition: property("description", length(isAtLeast(5000))),
    description: "Create a post with 5000+ characters",
    icon: "i-mdi:book-open-page-variant",
    inputSchema: createPostInputSchema,
    points: 50,
    triggerPath: "post.createPost",
  }),
  [PostAchievementName.PostDeleter]: defineAchievementDefinition({
    amount: 1,
    description: "Delete a post",
    icon: "i-mdi:delete-circle",
    inputSchema: deletePostInputSchema,
    points: 5,
    triggerPath: "post.deletePost",
  }),
  [PostAchievementName.PostEditor]: defineAchievementDefinition({
    amount: 1,
    description: "Edit a post",
    icon: "i-mdi:file-document-edit",
    inputSchema: updatePostInputSchema,
    points: 5,
    triggerPath: "post.updatePost",
  }),
  [PostAchievementName.PosterChild]: defineAchievementDefinition({
    amount: 1,
    description: "Create a post",
    icon: "i-mdi:post",
    inputSchema: createPostInputSchema,
    points: 10,
    triggerPath: "post.createPost",
  }),
  [PostAchievementName.ProlificPoster]: defineAchievementDefinition({
    amount: 25,
    description: "Create 25 posts",
    icon: "i-mdi:magnify",
    inputSchema: createPostInputSchema,
    points: 35,
    triggerPath: "post.createPost",
  }),
});
