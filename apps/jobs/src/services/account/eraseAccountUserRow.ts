import type { UserInAuth } from "@esposter/db-schema";

import { getOtherLikeTotal } from "#src/services/account/getOtherLikeTotal";
import { getPostRankingUpdates } from "#src/services/account/getPostRankingUpdates";
import { db } from "#src/services/shared/db";
import { likesInPost, postsInPost, usersInAuth } from "@esposter/db-schema";
import { and, eq, inArray, ne, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/sqlite-core";

// The user row goes last, in one batch with the recount of each stored count the erased rows feed, and the ranking that
// Follows a like count. Its cascade is what removes those rows, so each count is recounted from the rows that remain:
// Every row the cascade takes is excluded from the sum or the tally here, which is the state the cascade leaves. The
// Rankings are read ahead of the batch, since D1 does not authorise the logarithm the formula takes in SQL, and each is
// Written after the like recount in the batch, only while its count stands. A batch is one transaction, so no reader
// Sees a count ahead of its rows, and a replay that fails before the batch finds every count where it was
export const eraseAccountUserRow = async (userId: UserInAuth["id"]): Promise<void> => {
  const rankingUpdates = await getPostRankingUpdates(userId);
  await db.batch([
    recountPostLikes(userId),
    ...rankingUpdates,
    recountPostComments(userId),
    db.delete(usersInAuth).where(eq(usersInAuth.id, userId)),
  ]);
};

// A post's like count is the sum of its likes' values, recounted for each post the erased person liked
const recountPostLikes = (userId: UserInAuth["id"]) =>
  db
    .update(postsInPost)
    .set({ likeCount: sql`(${getOtherLikeTotal(userId)})` })
    .where(
      inArray(
        postsInPost.id,
        db.select({ postId: likesInPost.postId }).from(likesInPost).where(eq(likesInPost.userId, userId)),
      ),
    );

// A post's comment count is the replies beneath it, all in its thread. The replies the erasure removes are the erased
// Person's own and every reply beneath one of their posts, so each post above one of them is recounted without those.
// The thread's index bounds the rows the ancestor check runs over, as the post subtree query does
const recountPostComments = (userId: UserInAuth["id"]) => {
  const ownedPost = alias(postsInPost, "ownedPost");
  const reply = alias(postsInPost, "reply");
  const ownedPostIds = db.select({ id: ownedPost.id }).from(ownedPost).where(eq(ownedPost.userId, userId));
  const replyTotal = db
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
  return db
    .update(postsInPost)
    .set({ commentCount: sql`(${replyTotal})` })
    .where(
      sql`${postsInPost.id} in (select json_each.value from ${postsInPost} as ${sql.identifier("ownedPost")}, json_each(${ownedPost.ancestorIds}) where ${eq(ownedPost.userId, userId)})`,
    );
};
