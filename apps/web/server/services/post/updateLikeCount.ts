import type { Transaction } from "#server/models/db/Transaction";
import type { PostInPost } from "@esposter/db-schema";

import { getPostRanking } from "#server/services/post/getPostRanking";
import { postsInPost } from "@esposter/db-schema";
import { eq } from "drizzle-orm";

export const updateLikeCount = (tx: Transaction, post: Pick<PostInPost, "createdAt" | "id">, likeCount: number) =>
  tx
    .update(postsInPost)
    .set({ likeCount, ranking: getPostRanking(likeCount, post.createdAt) })
    .where(eq(postsInPost.id, post.id));
