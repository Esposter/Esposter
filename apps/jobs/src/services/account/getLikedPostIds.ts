import type { UserInAuth } from "@esposter/db-schema";

import { db } from "#src/services/shared/db";
import { likesInPost } from "@esposter/db-schema";
import { eq } from "drizzle-orm";

// The posts the erased person liked, as a subquery: the posts whose counts and rankings the erasure rewrites
export const getLikedPostIds = (userId: UserInAuth["id"]) =>
  db.select({ postId: likesInPost.postId }).from(likesInPost).where(eq(likesInPost.userId, userId));
