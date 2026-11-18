import type { UserInAuth } from "@esposter/db-schema";

import { getLikedPostIds } from "#src/services/account/getLikedPostIds";
import { getDb } from "#src/services/shared/db";
import { postsInPost } from "@esposter/db-schema";
import { getPostRanking } from "@esposter/shared";
import { and, eq, inArray } from "drizzle-orm";

// The ranking each post the erased person liked is stored with once their like is gone, one write per post. It runs after
// The recount, so the count it reads is the recounted one. D1 does not authorise the logarithm the formula takes in SQL, so
// The ranking is computed here from that count and the post's creation time. Each write holds only while the count it was
// Computed from still stands, as the vote path's own write does, so a vote that lands after this read moves the count and
// Keeps the ranking its own count wrote
export const getPostRankingUpdates = async (userId: UserInAuth["id"]) => {
  const likedPosts = await getDb()
    .select({ createdAt: postsInPost.createdAt, id: postsInPost.id, likeCount: postsInPost.likeCount })
    .from(postsInPost)
    .where(inArray(postsInPost.id, getLikedPostIds(userId)));
  return likedPosts.map(({ createdAt, id, likeCount }) =>
    getDb()
      .update(postsInPost)
      .set({ ranking: getPostRanking(likeCount, createdAt) })
      .where(and(eq(postsInPost.id, id), eq(postsInPost.likeCount, likeCount))),
  );
};
