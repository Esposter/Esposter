import type { LikeInPost } from "@esposter/db-schema";

import { likesInPost } from "@esposter/db-schema";
import { and, eq } from "drizzle-orm";

// A like has no id of its own: the pair is its whole key, so this is the row a member's vote on a post is. Its value is
// The one the vote is changed from, so a write names the value it was read at and a change landing first refuses it
export const getLikeWhere = (postId: LikeInPost["postId"], userId: LikeInPost["userId"], value: LikeInPost["value"]) =>
  and(eq(likesInPost.userId, userId), eq(likesInPost.postId, postId), eq(likesInPost.value, value));
