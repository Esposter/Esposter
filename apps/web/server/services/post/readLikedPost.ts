import type { Context } from "#server/trpc/context";
import type { PostInPost } from "@esposter/db-schema";

import { postsInPost } from "@esposter/db-schema";
import { eq } from "drizzle-orm";

// The count a vote moves is read here, but the move itself is an increment in the vote's batch, so two votes landing
// Together both add their own value rather than one replacing the other's
export const readLikedPost = async (
  db: Context["db"],
  postId: PostInPost["id"],
): Promise<Pick<PostInPost, "createdAt" | "id" | "likeCount"> | undefined> =>
  (
    await db
      .select({ createdAt: postsInPost.createdAt, id: postsInPost.id, likeCount: postsInPost.likeCount })
      .from(postsInPost)
      .where(eq(postsInPost.id, postId))
  )[0];
