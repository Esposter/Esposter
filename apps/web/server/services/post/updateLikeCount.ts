import type { Transaction } from "@@/server/models/db/Transaction";
import type { Post } from "@esposter/db-schema";

import { getPostRanking } from "@@/server/services/post/getPostRanking";
import { posts } from "@esposter/db-schema";
import { eq } from "drizzle-orm";

export const updateLikeCount = (tx: Transaction, post: Pick<Post, "createdAt" | "id">, likeCount: number) =>
  tx
    .update(posts)
    .set({ likeCount, ranking: getPostRanking(likeCount, post.createdAt) })
    .where(eq(posts.id, post.id));
