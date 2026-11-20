import type { LikeInPost } from "@esposter/db-schema";

import { likesInPost } from "@esposter/db-schema";
import { and, eq, isNull } from "drizzle-orm";

// A like has no id of its own: the pair is its whole key, so this is the row a member's vote on a post is. Its value is
// The one the vote is changed from, so a write names the value it was read at and a change landing first refuses it.
// A removed vote is a tombstone, which no write changes and no count holds
export const getLikeWhere = (postId: LikeInPost["postId"], userId: LikeInPost["userId"], value: LikeInPost["value"]) =>
  and(getLiveLikeWhere(postId, userId), eq(likesInPost.value, value));

// The live vote of a member on a post, whatever its value: the filter a removal, a re-vote and a count check name
export const getLiveLikeWhere = (postId: LikeInPost["postId"], userId: LikeInPost["userId"]) =>
  and(eq(likesInPost.userId, userId), eq(likesInPost.postId, postId), isNull(likesInPost.deletedAt));
