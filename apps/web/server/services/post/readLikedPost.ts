import type { Transaction } from "@@/server/models/db/Transaction";
import type { Post } from "@esposter/db-schema";

import { posts } from "@esposter/db-schema";
import { eq } from "drizzle-orm";

// Every vote write is a read-modify-write of `likeCount`, so the row is locked for the rest of the transaction:
// Two votes landing together would otherwise both read the pre-vote count and the later write would replace
// Rather than add, losing a vote and leaving `ranking` derived from a count that never existed. The lock is also
// What lets `getPostRanking` stay the one ranking formula, since a SQL-side increment could not call it
export const readLikedPost = async (
  tx: Transaction,
  postId: Post["id"],
): Promise<Pick<Post, "createdAt" | "id" | "likeCount"> | undefined> =>
  (
    await tx
      .select({ createdAt: posts.createdAt, id: posts.id, likeCount: posts.likeCount })
      .from(posts)
      .where(eq(posts.id, postId))
      .for("update")
  )[0];
