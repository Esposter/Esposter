import type { Transaction } from "@@/server/models/db/Transaction";
import type { Like, Post, User } from "@esposter/db-schema";

export const readLike = (tx: Transaction, postId: Post["id"], userId: User["id"]): Promise<Like | undefined> =>
  tx.query.likes.findFirst({
    where: {
      postId: {
        eq: postId,
      },
      userId: {
        eq: userId,
      },
    },
  });
