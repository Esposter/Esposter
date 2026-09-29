import type { LikeInPost } from "@esposter/db-schema";

import { likesInPost } from "@esposter/db-schema";
import { and, eq } from "drizzle-orm";

// A like has no id of its own: the pair is its whole key, so this is the row a member's vote on a post is
export const getLikeWhere = (postId: LikeInPost["postId"], userId: LikeInPost["userId"]) =>
  and(eq(likesInPost.userId, userId), eq(likesInPost.postId, postId));
