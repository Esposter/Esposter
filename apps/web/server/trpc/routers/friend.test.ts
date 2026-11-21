import type { Context } from "#server/trpc/context";
import type { TRPCRouter } from "#server/trpc/routers/index";
import type { DecorateRouterRecord } from "@trpc/server/unstable-core-do-not-import";

import { createMockAuthSession, createMockContext, getMockSession } from "#server/trpc/context.test";
import { createCallerFactory } from "#server/trpc/index";
import { getUncoveredWrites } from "#server/trpc/optimisticWriteCrossCheck.test";
import { createFriends } from "#server/trpc/routers/createFriends.test";
import { createFriendship } from "#server/trpc/routers/createFriendship.test";
import { friendRouter } from "#server/trpc/routers/friend";
import { ROW_VERSIONS_HEADER } from "#shared/services/realtime/constants";
import { getUnfriendEntry } from "#src/services/message/user/pair/getUnfriendEntry";
import {
  blocksInSocial,
  DatabaseEntityType,
  friendRequestsInSocial,
  friendsInSocial,
  PublicUserColumns,
} from "@esposter/db-schema";
import { getFriendshipId, InvalidOperationError, jsonDateParse, Operation, takeOne } from "@esposter/shared";
import { getTableName } from "drizzle-orm";
import { v7 } from "uuid";
import { afterEach, assert, beforeAll, describe, expect, test } from "vitest";

describe("friendRouter", () => {
  let mockContext: Context;
  let friendCaller: DecorateRouterRecord<TRPCRouter["friend"]>;

  beforeAll(async () => {
    mockContext = await createMockContext();
    friendCaller = createCallerFactory(friendRouter)(mockContext);
  });

  afterEach(async () => {
    await mockContext.db.delete(blocksInSocial);
    await mockContext.db.delete(friendsInSocial);
    await mockContext.db.delete(friendRequestsInSocial);
  });

  test("reads friends as sender", async () => {
    expect.hasAssertions();

    const { user } = await createFriendship(mockContext);
    const friendships = await friendCaller.readFriends();

    expect(friendships).toHaveLength(1);
    expect(takeOne(friendships).sender.id).toBe(user.id);
  });

  test("reads friends as receiver", async () => {
    expect.hasAssertions();

    const { user, userId } = await createFriendship(mockContext);
    const receiverAuthSession = await createMockAuthSession(mockContext.db, user);
    const receiverCaller = createCallerFactory(friendRouter)(await createMockContext(receiverAuthSession));
    const friendships = await receiverCaller.readFriends();

    expect(friendships).toHaveLength(1);
    expect(takeOne(friendships).receiver.id).toBe(userId);
  });

  test("deletes friend", async () => {
    expect.hasAssertions();

    const { user } = await createFriendship(mockContext);
    const tombstone = await friendCaller.deleteFriend(user.id);

    const friendships = await friendCaller.readFriends();

    expect(friendships).toHaveLength(1);
    expect(takeOne(friendships).id).toBe(tombstone.id);
    expect(takeOne(friendships).deletedAt).not.toBeNull();
    expect(takeOne(friendships).version).toBe(tombstone.version);
  });

  // A removal keeps the friendship as a tombstone, so the version it leaves is the one a later arrival is ordered against
  test("deletes friend as a tombstone at a higher version", async () => {
    expect.hasAssertions();

    const { user } = await createFriendship(mockContext);
    const tombstone = await friendCaller.deleteFriend(user.id);

    expect(tombstone.deletedAt).not.toBeNull();
    expect(tombstone.version).toBe(1);
  });

  test("revives a removed friendship at a higher version", async () => {
    expect.hasAssertions();

    const { user } = await createFriendship(mockContext);
    const tombstone = await friendCaller.deleteFriend(user.id);
    await createFriends(mockContext, user);
    const friendship = await mockContext.db.query.friendsInSocial.findFirst({ where: { id: { eq: tombstone.id } } });

    expect(friendship?.deletedAt).toBeNull();
    expect(friendship?.version).toBe(tombstone.version + 1);
  });

  // The removal's write returns the row it changed, so the row versions header names the tombstone at the version it left
  test("names a removed friendship at its tombstone version in the row versions header", async () => {
    expect.hasAssertions();

    const { user } = await createFriendship(mockContext);
    const context = await createMockContext();
    await createCallerFactory(friendRouter)(context).deleteFriend(user.id);

    // The header's value is the path and the encoded row version, read back here so the key's order is not the point
    const headerValue = context.responseHeaders.get(ROW_VERSIONS_HEADER);
    assert.exists(headerValue);
    const headerParts = headerValue.split(" ");

    expect(takeOne(headerParts, 0)).toBe("deleteFriend");
    expect(jsonDateParse(decodeURIComponent(takeOne(headerParts, 1)))).toStrictEqual({
      key: { receiverId: getMockSession().user.id, senderId: user.id },
      table: getTableName(friendsInSocial),
      version: 1,
    });
  });

  // The unfriend's entry shows the friendship row the removal writes, so the optimistic change covers every row the server names
  test("the unfriend entry touches every row the removal writes", async () => {
    expect.hasAssertions();

    const { user, userId } = await createFriendship(mockContext);
    const { named, uncovered } = await getUncoveredWrites({
      call: (context) => createCallerFactory(friendRouter)(context).deleteFriend(user.id),
      context: mockContext,
      entry: getUnfriendEntry(userId, user.id, new Date(0)),
      path: "deleteFriend",
    });

    expect(named).toHaveLength(1);
    expect(uncovered).toStrictEqual([]);
  });

  test("fails to delete self as friend", async () => {
    expect.hasAssertions();

    const userId = getMockSession().user.id;

    await expect(friendCaller.deleteFriend(userId)).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new InvalidOperationError(Operation.Delete, DatabaseEntityType.Friend, userId).message}]`,
    );
  });

  test("fails to delete non-existent friend", async () => {
    expect.hasAssertions();

    const userId = v7();
    const friendshipId = getFriendshipId(getMockSession().user.id, userId);

    await expect(friendCaller.deleteFriend(userId)).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new InvalidOperationError(Operation.Delete, DatabaseEntityType.Friend, friendshipId).message}]`,
    );
  });

  // A name substring reaches every account, so a result carries nothing private to the user it names
  test("searches users by name", async () => {
    expect.hasAssertions();

    const user = getMockSession().user;
    const searcherAuthSession = await createMockAuthSession(mockContext.db);
    const searcherCaller = createCallerFactory(friendRouter)(await createMockContext(searcherAuthSession));
    const searchedUsers = await searcherCaller.searchUsers(user.name);

    expect(searchedUsers).toHaveLength(1);
    expect(takeOne(searchedUsers).id).toBe(user.id);
    expect(Object.keys(takeOne(searchedUsers)).toSorted()).toStrictEqual(Object.keys(PublicUserColumns).toSorted());
  });

  test("excludes self from search results", async () => {
    expect.hasAssertions();

    const user = getMockSession().user;
    const searchedUsers = await friendCaller.searchUsers(user.name);

    expect(searchedUsers).toStrictEqual([]);
  });
});
