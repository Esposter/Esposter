import type { Context } from "#server/trpc/context";
import type { LikeInPost, PostInPost, UserInAuth } from "@esposter/db-schema";

export const readLike = (
  db: Context["db"],
  postId: PostInPost["id"],
  userId: UserInAuth["id"],
): Promise<LikeInPost | undefined> =>
  db.query.likesInPost.findFirst({ where: { postId: { eq: postId }, userId: { eq: userId } } });
