import type { UserInAuth } from "@esposter/db-schema";

import { computeOtherLikeTotal } from "#src/services/account/computeOtherLikeTotal";
import { computePostRankingUpdates } from "#src/services/account/computePostRankingUpdates";
import { getLikedPostIds } from "#src/services/account/getLikedPostIds";
import { getDb } from "#src/services/shared/getDb";
import { postsInPost, usersInAuth } from "@esposter/db-schema";
import { and, eq, inArray, ne, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/sqlite-core";

// The like counts are recounted first, from the rows that remain, since the rankings are read from them. The erased
// Person's likes and replies are still present here, and every sum and tally excludes them by predicate, so a replay
// That Runs a recount again sets each count from the rows that remain, which is right whichever run it is. The comment
// Counts, The rankings and the user row's delete are one batch with the delete as its last statement, so they commit
// Together. A Crash before that batch commits leaves the likes that name the affected posts for the queue's retry to
// Read
export const eraseAccountUserRow = async (userId: UserInAuth["id"]): Promise<void> => {
  await recountPostLikes(userId);
  const rankingUpdates = await computePostRankingUpdates(userId);
  await getDb().batch([
    recountPostComments(userId),
    ...rankingUpdates,
    getDb().delete(usersInAuth).where(eq(usersInAuth.id, userId)),
  ]);
};

// A post's like count is the sum of its likes' values, recounted for each post the erased person liked
const recountPostLikes = (userId: UserInAuth["id"]) =>
  getDb()
    .update(postsInPost)
    .set({ likeCount: sql`(${computeOtherLikeTotal(userId)})` })
    .where(inArray(postsInPost.id, getLikedPostIds(userId)));

// A post's comment count is the replies beneath it, all in its thread. The replies the erasure removes are the erased
// Person's own and every reply beneath one of their posts, so each post above one of them is recounted without those.
// The thread's index bounds the rows the ancestor check runs over, as the post subtree query does
const recountPostComments = (userId: UserInAuth["id"]) => {
  const ownedPost = alias(postsInPost, "ownedPost");
  const reply = alias(postsInPost, "reply");
  const ownedPostIds = getDb().select({ id: ownedPost.id }).from(ownedPost).where(eq(ownedPost.userId, userId));
  const replyTotal = getDb()
    .select({ total: sql<number>`count(*)` })
    .from(reply)
    .where(
      and(
        sql`json_extract(${reply.ancestorIds}, '$[0]') = coalesce(json_extract(${postsInPost.ancestorIds}, '$[0]'), ${postsInPost.id})`,
        sql`exists (select 1 from json_each(${reply.ancestorIds}) where json_each.value = ${postsInPost.id})`,
        ne(reply.userId, userId),
        sql`not exists (select 1 from json_each(${reply.ancestorIds}) where ${inArray(sql`json_each.value`, ownedPostIds)})`,
      ),
    );
  return getDb()
    .update(postsInPost)
    .set({ commentCount: sql`(${replyTotal})` })
    .where(
      sql`${postsInPost.id} in (select json_each.value from ${postsInPost} as ${sql.identifier("ownedPost")}, json_each(${ownedPost.ancestorIds}) where ${eq(ownedPost.userId, userId)})`,
    );
};
