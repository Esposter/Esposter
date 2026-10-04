import type { Transaction } from "#server/models/db/Transaction";
import type { LikeInPost, PostInPost, UserInAuth } from "@esposter/db-schema";

export const readLike = (
  tx: Transaction,
  postId: PostInPost["id"],
  userId: UserInAuth["id"],
): Promise<LikeInPost | undefined> =>
  tx.query.likesInPost.findFirst({ where: { postId: { eq: postId }, userId: { eq: userId } } });
