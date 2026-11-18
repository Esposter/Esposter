import type { UserInAuth } from "@esposter/db-schema";

import { getLikedPostIds } from "#src/services/account/getLikedPostIds";
import { getOtherLikeTotal } from "#src/services/account/getOtherLikeTotal";
import { db } from "#src/services/shared/db";
import { postsInPost } from "@esposter/db-schema";
import { getPostRanking } from "@esposter/shared";
import { and, eq, inArray, sql } from "drizzle-orm";

// The ranking each post the erased person liked is stored with once their like is gone, one write per post. The count
// Is read here so the ranking is the formula's, from the count and creation time the vote path reads. Each write holds
// Only while the count the batch recounts still stands, as the vote path's own write does, so a vote that lands between
// This read and the batch keeps the ranking its own count wrote
export const getPostRankingUpdates = async (userId: UserInAuth["id"]) => {
  const likedPosts = await db
    .select({
      createdAt: postsInPost.createdAt,
      id: postsInPost.id,
      likeCount: sql<number>`(${getOtherLikeTotal(userId)})`,
    })
    .from(postsInPost)
    .where(inArray(postsInPost.id, getLikedPostIds(userId)));
  return likedPosts.map(({ createdAt, id, likeCount }) =>
    db
      .update(postsInPost)
      .set({ ranking: getPostRanking(likeCount, createdAt) })
      .where(and(eq(postsInPost.id, id), eq(postsInPost.likeCount, likeCount))),
  );
};
