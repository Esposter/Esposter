import type { UserInAuth } from "@esposter/db-schema";

import { getDb } from "#src/services/shared/getDb";
import { likesInPost } from "@esposter/db-schema";
import { eq } from "drizzle-orm";

// The posts the erased person liked, as a subquery: the posts whose counts and rankings the erasure rewrites
export const getLikedPostIds = (userId: UserInAuth["id"]) =>
  getDb().select({ postId: likesInPost.postId }).from(likesInPost).where(eq(likesInPost.userId, userId));
