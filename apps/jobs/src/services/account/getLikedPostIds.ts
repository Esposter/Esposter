import type { UserInAuth } from "@esposter/db-schema";

import { getDb } from "#src/services/shared/getDb";
import { likesInPost } from "@esposter/db-schema";
import { and, eq, isNull } from "drizzle-orm";

// The posts the erased person liked, as a subquery: the posts whose counts and rankings the erasure rewrites. A removed
// Vote is a tombstone the count no longer holds, so only the live votes name a post
export const getLikedPostIds = (userId: UserInAuth["id"]) =>
  getDb()
    .select({ postId: likesInPost.postId })
    .from(likesInPost)
    .where(and(eq(likesInPost.userId, userId), isNull(likesInPost.deletedAt)));
