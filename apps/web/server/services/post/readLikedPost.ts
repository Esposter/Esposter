import type { Context } from "#server/trpc/context";
import type { PostInPost } from "@esposter/db-schema";

import { getLiveRowWhere, postsInPost } from "@esposter/db-schema";
import { and, eq } from "drizzle-orm";

// The post a vote is cast on, read before its batch so a missing post is refused before any write. The batch itself moves
// The count by an increment rather than from this read, so two votes landing together both add their own value. A removed
// Post is no post to vote on
export const readLikedPost = async (
  db: Context["db"],
  postId: PostInPost["id"],
): Promise<Pick<PostInPost, "createdAt" | "id"> | undefined> =>
  (
    await db
      .select({ createdAt: postsInPost.createdAt, id: postsInPost.id })
      .from(postsInPost)
      .where(and(eq(postsInPost.id, postId), getLiveRowWhere(postsInPost)))
  )[0];
