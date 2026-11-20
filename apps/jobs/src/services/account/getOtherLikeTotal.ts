import type { UserInAuth } from "@esposter/db-schema";

import { getDb } from "#src/services/shared/getDb";
import { likesInPost, postsInPost } from "@esposter/db-schema";
import { and, eq, isNull, ne, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/sqlite-core";

// A post's like count once the erased person's like is gone: the sum of the values of the live likes the post keeps
export const getOtherLikeTotal = (userId: UserInAuth["id"]) => {
  const otherLike = alias(likesInPost, "otherLike");
  return getDb()
    .select({ total: sql<number>`coalesce(sum(${otherLike.value}), 0)` })
    .from(otherLike)
    .where(and(eq(otherLike.postId, postsInPost.id), ne(otherLike.userId, userId), isNull(otherLike.deletedAt)));
};
