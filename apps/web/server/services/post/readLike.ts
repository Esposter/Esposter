import type { Context } from "#server/trpc/context";
import type { LikeInPost, PostInPost, UserInAuth } from "@esposter/db-schema";

// The live vote of a member on a post. A removed vote is a tombstone, so it is no vote to update or remove
export const readLike = (
  db: Context["db"],
  postId: PostInPost["id"],
  userId: UserInAuth["id"],
): Promise<LikeInPost | undefined> =>
  db.query.likesInPost.findFirst({
    where: { deletedAt: { isNull: true }, postId: { eq: postId }, userId: { eq: userId } },
  });
