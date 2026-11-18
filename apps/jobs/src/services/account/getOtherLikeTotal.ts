import type { UserInAuth } from "@esposter/db-schema";

import { getDb } from "#src/services/shared/db";
import { likesInPost, postsInPost } from "@esposter/db-schema";
import { and, eq, ne, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/sqlite-core";

// A post's like count once the erased person's like is gone: the sum of the values of the likes the post keeps
export const getOtherLikeTotal = (userId: UserInAuth["id"]) => {
  const otherLike = alias(likesInPost, "otherLike");
  return getDb()
    .select({ total: sql<number>`coalesce(sum(${otherLike.value}), 0)` })
    .from(otherLike)
    .where(and(eq(otherLike.postId, postsInPost.id), ne(otherLike.userId, userId)));
};
