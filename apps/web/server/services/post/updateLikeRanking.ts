import type { Context } from "#server/trpc/context";
import type { PostInPost } from "@esposter/db-schema";

import { getPostRanking } from "#server/services/post/getPostRanking";
import { postsInPost } from "@esposter/db-schema";
import { and, eq } from "drizzle-orm";

// The ranking is a function of the count, so it is written from the count the vote's batch returned, and only while
// That count still stands: a vote landing after this one moves the count on and writes its own ranking, so the last
// Write always carries the final count
export const updateLikeRanking = (db: Context["db"], post: Pick<PostInPost, "createdAt" | "id">, likeCount: number) =>
  db
    .update(postsInPost)
    .set({ ranking: getPostRanking(likeCount, post.createdAt) })
    .where(and(eq(postsInPost.id, post.id), eq(postsInPost.likeCount, likeCount)));
