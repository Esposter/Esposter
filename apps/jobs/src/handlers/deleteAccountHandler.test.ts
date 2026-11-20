import type { Database } from "@esposter/db-schema";

import { deleteAccountHandler } from "#src/handlers/deleteAccountHandler";
import { getReaderWakes, MockPublishedTopics } from "#src/services/realtime/publishTopics.test";
import { OBJECT_READ_PAGE_LIMIT } from "#src/services/shared/constants";
import { runUnit } from "#src/services/shared/runUnit";
import { readBlobNames } from "#src/services/storage/readBlobNames.test";
import { seedBlob } from "#src/services/storage/seedBlob.test";
import { getContentBlobName, getMemberRoomIds } from "@esposter/db";
import {
  clearMockBuckets,
  clearRoomObjectCalls,
  clearUserObjectCalls,
  createMockDb,
  createUser,
  disposeMockBuckets,
  openMockBuckets,
  roomObjectCalls,
  roomObjectReplies,
  userObjectReplies,
} from "@esposter/db-mock";
import {
  accountsInAuth,
  getScopeTopic,
  getUserProfileImageBlobName,
  likesInPost,
  postsInPost,
  resourcesInResource,
  ResourceType,
  roomsInMessage,
  StorageBucket,
  storageLedgerInStorage,
  usersInAuth,
  usersToRoomsInMessage,
} from "@esposter/db-schema";
import { getPostRanking, takeOne } from "@esposter/shared";
import { eq, getTableName } from "drizzle-orm";
import { v7 } from "uuid";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, test, vi } from "vitest";

// A bucket binding is a proxy a spy cannot reach, so the blob sweep is failed at its own step instead
const blobSweepFailure = vi.hoisted(() => ({ error: undefined as Error | undefined }));

vi.mock(import("#src/services/storage/getBucket"), () => import("@esposter/db-mock"));
vi.mock(import("#src/services/room/getRoomObject"), () => import("@esposter/db-mock"));
vi.mock(import("#src/services/user/getUserObject"), () => import("@esposter/db-mock"));
vi.mock(import("#src/services/account/deleteAccountBlobDirectories"), async (importOriginal) => {
  const { deleteAccountBlobDirectories } = await importOriginal();
  return {
    deleteAccountBlobDirectories: async (userId: string) => {
      if (blobSweepFailure.error) throw blobSweepFailure.error;
      await deleteAccountBlobDirectories(userId);
    },
  };
});

// The sweep runs as the queue runs it, in the unit whose writes are published once it settles
const sweep = (userId: string) => runUnit(() => deleteAccountHandler({ userId }));

describe(deleteAccountHandler, () => {
  let mockDb: Database;

  const readUserRows = (userId: string) =>
    mockDb.select({ id: usersInAuth.id }).from(usersInAuth).where(eq(usersInAuth.id, userId));
  const name = "name";
  const countedBytes = 1;

  beforeAll(async () => {
    mockDb = (await createMockDb()).db;
    await openMockBuckets([
      StorageBucket.ClickerAssets,
      StorageBucket.GenshinAssets,
      StorageBucket.MessageAssets,
      StorageBucket.PublicUserAssets,
      StorageBucket.ResourceAssets,
      StorageBucket.UserAssets,
    ]);
  });

  // The beforeEach answers each room and person read a sweep makes with an empty page, so a sweep ends on its first page
  beforeEach(() => {
    roomObjectReplies.set("deleteUserMessages", () => []);
    roomObjectReplies.set("deleteUserReactions", () => []);
    userObjectReplies.set("readScheduledMessages", () => []);
  });

  afterEach(async () => {
    vi.restoreAllMocks();
    blobSweepFailure.error = undefined;
    await clearMockBuckets();
    clearRoomObjectCalls();
    clearUserObjectCalls();
    await mockDb.delete(usersInAuth);
  });

  afterAll(async () => {
    await disposeMockBuckets();
  });

  test("deletes the user row, and the sign-in accounts it holds cascade with it", async () => {
    expect.hasAssertions();

    const userId = v7();
    await mockDb.insert(usersInAuth).values(createUser(userId));
    await mockDb.insert(accountsInAuth).values({ accountId: "accountId", id: v7(), providerId: "providerId", userId });

    await sweep(userId);

    await expect(readUserRows(userId)).resolves.toStrictEqual([]);
    await expect(
      mockDb.select({ id: accountsInAuth.id }).from(accountsInAuth).where(eq(accountsInAuth.userId, userId)),
    ).resolves.toStrictEqual([]);
  });

  test("keeps the user row when the blob sweep fails, so the redelivery can finish it", async () => {
    expect.hasAssertions();

    const userId = v7();
    await mockDb.insert(usersInAuth).values(createUser(userId));
    blobSweepFailure.error = new Error(" ");

    await expect(sweep(userId)).rejects.toThrowErrorMatchingInlineSnapshot(`[Error:  ]`);
    await expect(readUserRows(userId)).resolves.toStrictEqual([{ id: userId }]);
  });

  // A membership the erased person holds is read by their own list of rooms, and the row that erases them takes it out, so the
  // Read is woken by the write the sweep makes, not by a topic named by hand
  test("wakes the reader of each membership the erased person's row takes with it", async () => {
    expect.hasAssertions();

    const userId = v7();
    const otherUserId = v7();
    await mockDb.insert(usersInAuth).values([createUser(userId), createUser(otherUserId)]);
    const memberRoom = takeOne(await mockDb.insert(roomsInMessage).values({ name, userId: otherUserId }).returning());
    await mockDb.insert(usersToRoomsInMessage).values({ roomId: memberRoom.id, userId });
    MockPublishedTopics.length = 0;

    await sweep(userId);

    await expect(getReaderWakes(mockDb, (database) => getMemberRoomIds(database, userId))).resolves.toContain(
      getScopeTopic(getTableName(usersToRoomsInMessage), "userId", userId),
    );
  });

  // A post's like count is the sum of its likes, so the erased person's like leaves it with the row that holds it, and
  // The ranking the count is stored under follows it
  test("recounts a post's likes and ranking without the erased person's like", async () => {
    expect.hasAssertions();

    const userId = v7();
    const otherUserId = v7();
    const friendUserId = v7();
    await mockDb.insert(usersInAuth).values([createUser(userId), createUser(otherUserId), createUser(friendUserId)]);
    const post = takeOne(
      await mockDb.insert(postsInPost).values({ likeCount: 2, ranking: 0, userId: otherUserId }).returning(),
    );
    await mockDb.insert(likesInPost).values([
      { postId: post.id, userId, value: 1 },
      { postId: post.id, userId: friendUserId, value: 1 },
    ]);

    await sweep(userId);

    await expect(
      mockDb
        .select({ likeCount: postsInPost.likeCount, ranking: postsInPost.ranking })
        .from(postsInPost)
        .where(eq(postsInPost.id, post.id)),
    ).resolves.toStrictEqual([{ likeCount: 1, ranking: getPostRanking(1, post.createdAt) }]);
  });

  // A post's comment count is the replies beneath it: the erased comment and every reply beneath it leave the count, and
  // The reply that stays beneath the post stays in it
  test("recounts a post's comments without the erased person's comment or the replies beneath it", async () => {
    expect.hasAssertions();

    const userId = v7();
    const otherUserId = v7();
    await mockDb.insert(usersInAuth).values([createUser(userId), createUser(otherUserId)]);
    const post = takeOne(
      await mockDb.insert(postsInPost).values({ commentCount: 3, ranking: 0, userId: otherUserId }).returning(),
    );
    const comment = takeOne(
      await mockDb
        .insert(postsInPost)
        .values({ ancestorIds: [post.id], depth: 1, parentId: post.id, ranking: 0, userId })
        .returning(),
    );
    await mockDb.insert(postsInPost).values([
      { ancestorIds: [post.id, comment.id], depth: 2, parentId: comment.id, ranking: 0, userId: otherUserId },
      { ancestorIds: [post.id], depth: 1, parentId: post.id, ranking: 0, userId: otherUserId },
    ]);

    await sweep(userId);

    await expect(
      mockDb.select({ commentCount: postsInPost.commentCount }).from(postsInPost).where(eq(postsInPost.id, post.id)),
    ).resolves.toStrictEqual([{ commentCount: 1 }]);
  });

  test("a second run over a finished sweep finds nothing and succeeds", async () => {
    expect.hasAssertions();

    const userId = v7();
    const otherUserId = v7();
    const fileId = v7();
    await mockDb.insert(usersInAuth).values([createUser(userId), createUser(otherUserId)]);
    const ownedRoom = takeOne(await mockDb.insert(roomsInMessage).values({ name, userId }).returning());
    const memberRoom = takeOne(await mockDb.insert(roomsInMessage).values({ name, userId: otherUserId }).returning());
    await mockDb.insert(usersToRoomsInMessage).values({ roomId: memberRoom.id, userId });
    const ownedResource = takeOne(
      await mockDb.insert(resourcesInResource).values({ name, type: ResourceType.Note, userId }).returning(),
    );
    await seedBlob(StorageBucket.ResourceAssets, getContentBlobName(ownedResource.id));
    await seedBlob(StorageBucket.PublicUserAssets, getUserProfileImageBlobName(userId));
    await seedBlob(StorageBucket.MessageAssets, `${ownedRoom.id}/${fileId}`);
    await seedBlob(StorageBucket.MessageAssets, `${memberRoom.id}/${fileId}`);
    await mockDb
      .insert(storageLedgerInStorage)
      .values({
        blobName: `${memberRoom.id}/${fileId}`,
        countedBytes,
        declaredBytes: countedBytes,
        expiresAt: new Date(0),
        storageBucket: StorageBucket.MessageAssets,
        userId,
      });
    await mockDb.update(usersInAuth).set({ storageBytesUsed: countedBytes }).where(eq(usersInAuth.id, userId));

    await expect(sweep(userId)).resolves.toBeUndefined();
    await expect(sweep(userId)).resolves.toBeUndefined();

    await expect(readUserRows(userId)).resolves.toStrictEqual([]);
    await expect(
      mockDb.select({ id: roomsInMessage.id }).from(roomsInMessage).where(eq(roomsInMessage.userId, userId)),
    ).resolves.toStrictEqual([]);
    // Only the first run sends anything: the second finds no owned room and no membership left
    // The leave's payload is the tombstone the erase wrote at the clock's time, which the erase job's own suite pins exactly
    const leaveCall = roomObjectCalls.find(({ method }) => method === "notifyOnlineMembers");
    expect(roomObjectCalls).toStrictEqual([
      { args: [[]], method: "deleteAll", objectId: ownedRoom.id },
      {
        args: [{ after: undefined, limit: OBJECT_READ_PAGE_LIMIT, userId }],
        method: "deleteUserMessages",
        objectId: memberRoom.id,
      },
      {
        args: [{ after: undefined, limit: OBJECT_READ_PAGE_LIMIT, userId }],
        method: "deleteUserReactions",
        objectId: memberRoom.id,
      },
      { args: [userId], method: "removeMember", objectId: memberRoom.id },
      leaveCall,
    ]);
    await expect(readBlobNames(StorageBucket.ResourceAssets)).resolves.toStrictEqual([]);
    await expect(readBlobNames(StorageBucket.PublicUserAssets)).resolves.toStrictEqual([]);
    await expect(readBlobNames(StorageBucket.MessageAssets)).resolves.toStrictEqual([]);
  });
});
