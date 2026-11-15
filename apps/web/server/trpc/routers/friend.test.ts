import type { Context } from "#server/trpc/context";
import type { TRPCRouter } from "#server/trpc/routers/index";
import type { DecorateRouterRecord } from "@trpc/server/unstable-core-do-not-import";

import { userObjectCalls } from "#server/composables/realtime/useUserObject.test";
import { createMockAuthSession, createMockContext, getMockSession } from "#server/trpc/context.test";
import { createCallerFactory } from "#server/trpc/index";
import { createFriendship } from "#server/trpc/routers/createFriendship.test";
import { friendRouter } from "#server/trpc/routers/friend";
import { readTopicsHeader } from "#shared/services/realtime/readTopicsHeader";
import {
  blocksInSocial,
  DatabaseEntityType,
  friendRequestsInSocial,
  friendsInSocial,
  getTopic,
  PublicUserColumns,
  TopicKind,
} from "@esposter/db-schema";
import { getFriendshipId, InvalidOperationError, Operation, takeOne } from "@esposter/shared";
import { v7 } from "uuid";
import { afterEach, beforeAll, describe, expect, test } from "vitest";

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
    userObjectCalls.length = 0;
  });

  test("reads friends as sender", async () => {
    expect.hasAssertions();

    const { user } = await createFriendship(mockContext);
    const friendUsers = await friendCaller.readFriends();

    expect(friendUsers).toHaveLength(1);
    expect(takeOne(friendUsers).id).toBe(user.id);
  });

  test("watches each friend's own topic, so a renamed friend refreshes the list", async () => {
    expect.hasAssertions();

    const { user } = await createFriendship(mockContext);
    const readContext = await createMockContext();
    await createCallerFactory(friendRouter)(readContext).readFriends();

    expect(readTopicsHeader(readContext.responseHeaders, "readFriends")).toStrictEqual([
      getTopic(TopicKind.Friend, getMockSession().user.id),
      getTopic(TopicKind.User, user.id),
    ]);
  });

  test("reads friends as receiver", async () => {
    expect.hasAssertions();

    const { user, userId } = await createFriendship(mockContext);
    const receiverAuthSession = await createMockAuthSession(mockContext.db, user);
    const receiverCaller = createCallerFactory(friendRouter)(await createMockContext(receiverAuthSession));
    const friendUsers = await receiverCaller.readFriends();

    expect(friendUsers).toHaveLength(1);
    expect(takeOne(friendUsers).id).toBe(userId);
  });

  test("deletes friend", async () => {
    expect.hasAssertions();

    const { user } = await createFriendship(mockContext);
    await friendCaller.deleteFriend(user.id);

    const friendUsers = await friendCaller.readFriends();

    expect(friendUsers).toStrictEqual([]);
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

  test("sends the friend deletion to both people's objects", async () => {
    expect.hasAssertions();

    const { user, userId } = await createFriendship(mockContext);
    await friendCaller.deleteFriend(user.id);

    expect(userObjectCalls.filter(({ method }) => method === "deleteFriend")).toStrictEqual([
      { args: [{ receiverId: user.id, senderId: userId }], method: "deleteFriend", userId },
      { args: [{ receiverId: user.id, senderId: userId }], method: "deleteFriend", userId: user.id },
    ]);
  });
});
