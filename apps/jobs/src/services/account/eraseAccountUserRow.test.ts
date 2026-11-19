import type { Database, PostInPost } from "@esposter/db-schema";

import { eraseAccountUserRow } from "#src/services/account/eraseAccountUserRow";
import { createUser } from "#src/services/shared/createUser.test";
import { createMockDb } from "@esposter/db-mock";
import { likesInPost, postsInPost, usersInAuth } from "@esposter/db-schema";
import { getPostRanking, takeOne } from "@esposter/shared";
import { and, eq, sql } from "drizzle-orm";
import { v7 } from "uuid";
import { afterEach, beforeAll, describe, expect, test, vi } from "vitest";

let mockDb: Database;

// The hooks run either side of the post read the rankings are built from, so a test lands a vote in the gap the erasure
// Leaves between two of its steps
const rankingHook = vi.hoisted(() => ({
  afterRead: undefined as (() => Promise<void>) | undefined,
  beforeRead: undefined as (() => Promise<void>) | undefined,
}));

vi.mock(import("#src/services/shared/db"), () => ({
  get db() {
    return mockDb;
  },
}));
vi.mock(import("#src/services/account/getPostRankingUpdates"), async (importOriginal) => {
  const { getPostRankingUpdates } = await importOriginal();
  return {
    getPostRankingUpdates: async (userId: string) => {
      await rankingHook.beforeRead?.();
      const updates = await getPostRankingUpdates(userId);
      await rankingHook.afterRead?.();
      return updates;
    },
  };
});

// The vote path's createLike as its batch: the like's row and the count it moves commit together, and the ranking
// Follows the count the batch returned, guarded by that count
const castVote = async (post: Pick<PostInPost, "createdAt" | "id">, userId: string, value: -1 | 1) => {
  const [, updatedPostRows] = await mockDb.batch([
    mockDb.insert(likesInPost).values({ postId: post.id, userId, value }).returning(),
    mockDb
      .update(postsInPost)
      .set({ likeCount: sql`${postsInPost.likeCount} + ${value}` })
      .where(eq(postsInPost.id, post.id))
      .returning({ likeCount: postsInPost.likeCount }),
  ]);
  const { likeCount } = takeOne(updatedPostRows);
  await mockDb
    .update(postsInPost)
    .set({ ranking: getPostRanking(likeCount, post.createdAt) })
    .where(and(eq(postsInPost.id, post.id), eq(postsInPost.likeCount, likeCount)));
};

const readPost = (postId: string) =>
  mockDb
    .select({ likeCount: postsInPost.likeCount, ranking: postsInPost.ranking })
    .from(postsInPost)
    .where(eq(postsInPost.id, postId));

const readUserRows = (userId: string) =>
  mockDb.select({ id: usersInAuth.id }).from(usersInAuth).where(eq(usersInAuth.id, userId));

describe(eraseAccountUserRow, () => {
  beforeAll(async () => {
    mockDb = (await createMockDb()).db;
  });

  afterEach(async () => {
    rankingHook.afterRead = undefined;
    rankingHook.beforeRead = undefined;
    await mockDb.delete(usersInAuth);
  });

  // A post at count 1 from the erased person's like. The erasure reads it at 0 once that like is set aside, and a +1 vote
  // By another person lands after the read. The post ends at the count the erasure leaves, with that count's ranking
  test("ends a post's ranking at the count the erasure leaves when a vote lands after the erasure reads the count", async () => {
    expect.hasAssertions();

    const userId = v7();
    const authorUserId = v7();
    const voterUserId = v7();
    await mockDb.insert(usersInAuth).values([createUser(userId), createUser(authorUserId), createUser(voterUserId)]);
    const post = takeOne(
      await mockDb.insert(postsInPost).values({ likeCount: 1, ranking: 0, userId: authorUserId }).returning(),
    );
    await mockDb.insert(likesInPost).values({ postId: post.id, userId, value: 1 });
    rankingHook.afterRead = () => castVote(post, voterUserId, 1);

    await eraseAccountUserRow(userId);

    await expect(readPost(post.id)).resolves.toStrictEqual([
      { likeCount: 1, ranking: getPostRanking(1, post.createdAt) },
    ]);
  });

  // A vote that lands between the erasure's read and its guarded write moves the count, so the write fails, and the
  // Ranking the vote wrote for its own count is the one that stays
  test("keeps the ranking a vote wrote when the vote lands after the erasure reads the count", async () => {
    expect.hasAssertions();

    const userId = v7();
    const authorUserId = v7();
    const otherUserId = v7();
    const secondOtherUserId = v7();
    const voterUserId = v7();
    await mockDb
      .insert(usersInAuth)
      .values([
        createUser(userId),
        createUser(authorUserId),
        createUser(otherUserId),
        createUser(secondOtherUserId),
        createUser(voterUserId),
      ]);
    const post = takeOne(
      await mockDb.insert(postsInPost).values({ likeCount: 3, ranking: 0, userId: authorUserId }).returning(),
    );
    await mockDb.insert(likesInPost).values([
      { postId: post.id, userId, value: 1 },
      { postId: post.id, userId: otherUserId, value: 1 },
      { postId: post.id, userId: secondOtherUserId, value: 1 },
    ]);
    rankingHook.afterRead = () => castVote(post, voterUserId, -1);

    await eraseAccountUserRow(userId);

    await expect(readPost(post.id)).resolves.toStrictEqual([
      { likeCount: 1, ranking: getPostRanking(1, post.createdAt) },
    ]);
  });

  // A vote that lands after the recount and before the row goes adds its value to the recounted count, which has the
  // Erased person's like taken out, and the cascade then removes that like without touching the count
  test("counts a vote that lands after the recount without the erased person's like", async () => {
    expect.hasAssertions();

    const userId = v7();
    const authorUserId = v7();
    const otherUserId = v7();
    const voterUserId = v7();
    await mockDb
      .insert(usersInAuth)
      .values([createUser(userId), createUser(authorUserId), createUser(otherUserId), createUser(voterUserId)]);
    const post = takeOne(
      await mockDb.insert(postsInPost).values({ likeCount: 2, ranking: 0, userId: authorUserId }).returning(),
    );
    await mockDb.insert(likesInPost).values([
      { postId: post.id, userId, value: 1 },
      { postId: post.id, userId: otherUserId, value: 1 },
    ]);
    rankingHook.beforeRead = () => castVote(post, voterUserId, 1);

    await eraseAccountUserRow(userId);

    await expect(readPost(post.id)).resolves.toStrictEqual([
      { likeCount: 2, ranking: getPostRanking(2, post.createdAt) },
    ]);
  });

  // The user row goes last, so a failure before the rankings are written leaves the row and the likes it names for the
  // Queue's retry to find, and the retry finishes the erasure from the same rows
  test("finishes the erasure on a replay after a failure between the recount and the ranking writes", async () => {
    expect.hasAssertions();

    const userId = v7();
    const authorUserId = v7();
    const otherUserId = v7();
    await mockDb.insert(usersInAuth).values([createUser(userId), createUser(authorUserId), createUser(otherUserId)]);
    const post = takeOne(
      await mockDb.insert(postsInPost).values({ likeCount: 2, ranking: 0, userId: authorUserId }).returning(),
    );
    await mockDb.insert(likesInPost).values([
      { postId: post.id, userId, value: 1 },
      { postId: post.id, userId: otherUserId, value: 1 },
    ]);
    rankingHook.beforeRead = () => {
      rankingHook.beforeRead = undefined;
      throw new Error("erasure paused");
    };

    await expect(eraseAccountUserRow(userId)).rejects.toThrowErrorMatchingInlineSnapshot(`[Error: erasure paused]`);
    await expect(readUserRows(userId)).resolves.toStrictEqual([{ id: userId }]);

    await eraseAccountUserRow(userId);

    await expect(readPost(post.id)).resolves.toStrictEqual([
      { likeCount: 1, ranking: getPostRanking(1, post.createdAt) },
    ]);
    await expect(readUserRows(userId)).resolves.toStrictEqual([]);
  });
});
