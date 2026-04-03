import type { Context } from "@@/server/trpc/context";
import type { TRPCRouter } from "@@/server/trpc/routers";
import type { DecorateRouterRecord } from "@trpc/server/unstable-core-do-not-import";

import { createCallerFactory } from "@@/server/trpc";
import { createMockContext, getMockSession, mockSessionOnce } from "@@/server/trpc/context.test";
import { friendRouter } from "@@/server/trpc/routers/friend";
import { DatabaseEntityType, friends, FriendshipStatus } from "@esposter/db-schema";
import { ID_SEPARATOR, InvalidOperationError, Operation, takeOne } from "@esposter/shared";
import { afterEach, beforeAll, describe, expect, test } from "vitest";

describe("friend", () => {
  let caller: DecorateRouterRecord<TRPCRouter["friend"]>;
  let mockContext: Context;

  beforeAll(async () => {
    const createCaller = createCallerFactory(friendRouter);
    mockContext = await createMockContext();
    caller = createCaller(mockContext);
  });

  afterEach(async () => {
    await mockContext.db.delete(friends);
  });

  test("sends friend request", async () => {
    expect.hasAssertions();

    const { user } = await mockSessionOnce(mockContext.db);
    const userId = getMockSession().user.id;
    // session=user: sends request to default user
    const friend = await caller.sendFriendRequest(userId);

    expect(friend.senderId).toBe(user.id);
    expect(friend.receiverId).toBe(userId);
    expect(friend.status).toBe(FriendshipStatus.Pending);
  });

  test("sends friend request is idempotent", async () => {
    expect.hasAssertions();

    await mockSessionOnce(mockContext.db);
    const userId = getMockSession().user.id;
    // session=user
    const friend1 = await caller.sendFriendRequest(userId);
    const friend2 = await caller.sendFriendRequest(userId);

    expect(friend1.id).toBe(friend2.id);
  });

  test("fails send friend request to self", async () => {
    expect.hasAssertions();

    const userId = getMockSession().user.id;

    await expect(caller.sendFriendRequest(userId)).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new InvalidOperationError(Operation.Create, DatabaseEntityType.Friend, userId).message}]`,
    );
  });

  test("accepts friend request", async () => {
    expect.hasAssertions();

    const userId = getMockSession().user.id;
    const { user } = await mockSessionOnce(mockContext.db);
    // session=user: sends request to default user
    await caller.sendFriendRequest(userId);
    // session=default: accepts request from user
    const accepted = await caller.acceptFriendRequest(user.id);

    expect(accepted.status).toBe(FriendshipStatus.Accepted);
    expect(accepted.senderId).toBe(user.id);
    expect(accepted.receiverId).toBe(userId);
  });

  test("fails accept non-existent friend request", async () => {
    expect.hasAssertions();

    const userId = getMockSession().user.id;
    const { user } = await mockSessionOnce(mockContext.db);
    const id = [userId, user.id].toSorted().join(ID_SEPARATOR);

    // session=user: no request exists, try to accept from default user
    await expect(caller.acceptFriendRequest(userId)).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new InvalidOperationError(Operation.Update, DatabaseEntityType.Friend, id).message}]`,
    );
  });

  test("declines friend request", async () => {
    expect.hasAssertions();

    const userId = getMockSession().user.id;
    const { user } = await mockSessionOnce(mockContext.db);
    // session=user: sends request to default user
    await caller.sendFriendRequest(userId);
    // session=default: declines
    await caller.declineFriendRequest(user.id);

    const pendingRequests = await caller.readPendingRequests();

    expect(pendingRequests).toHaveLength(0);
  });

  test("deletes friend", async () => {
    expect.hasAssertions();

    const userId = getMockSession().user.id;
    const { user } = await mockSessionOnce(mockContext.db);
    // session=user: sends; session=default: accepts; then deletes
    await caller.sendFriendRequest(userId);
    await caller.acceptFriendRequest(user.id);
    await caller.deleteFriend(user.id);

    const friendList = await caller.readFriends();

    expect(friendList).toHaveLength(0);
  });

  test("reads friends as sender", async () => {
    expect.hasAssertions();

    const userId = getMockSession().user.id;
    const { user } = await mockSessionOnce(mockContext.db);
    // session=user: sends; session=default: accepts
    await caller.sendFriendRequest(userId);
    await caller.acceptFriendRequest(user.id);

    const friendList = await caller.readFriends();

    expect(friendList).toHaveLength(1);
    expect(takeOne(friendList).id).toBe(user.id);
  });

  test("reads friends as receiver", async () => {
    expect.hasAssertions();

    const userId = getMockSession().user.id;
    const { user } = await mockSessionOnce(mockContext.db);
    // session=user: sends; session=default: accepts
    await caller.sendFriendRequest(userId);
    await caller.acceptFriendRequest(user.id);

    // session=user: reads their own friends list
    await mockSessionOnce(mockContext.db, user);
    const friendList = await caller.readFriends();

    expect(friendList).toHaveLength(1);
    expect(takeOne(friendList).id).toBe(userId);
  });

  test("reads pending requests", async () => {
    expect.hasAssertions();

    const userId = getMockSession().user.id;
    const { user } = await mockSessionOnce(mockContext.db);
    // session=user: sends request to default user
    await caller.sendFriendRequest(userId);
    // session=default: reads pending
    const pendingRequests = await caller.readPendingRequests();

    expect(pendingRequests).toHaveLength(1);
    expect(takeOne(pendingRequests).id).toBe(user.id);
  });

  test("reads sent requests", async () => {
    expect.hasAssertions();

    const userId = getMockSession().user.id;
    const { user } = await mockSessionOnce(mockContext.db);
    // session=user: sends request to default user
    await caller.sendFriendRequest(userId);
    // session=user again: reads sent requests
    await mockSessionOnce(mockContext.db, user);
    const sentRequests = await caller.readSentRequests();

    expect(sentRequests).toHaveLength(1);
    expect(takeOne(sentRequests).id).toBe(userId);
  });

  test("searches users by name", async () => {
    expect.hasAssertions();

    const user = getMockSession().user;
    // session=user: search for default user by name
    const results = await caller.searchUsers(user.name);

    expect(results).toHaveLength(1);
    expect(takeOne(results).id).toBe(user.id);
  });

  test("excludes self from search results", async () => {
    expect.hasAssertions();

    const user = getMockSession().user;
    const results = await caller.searchUsers(user.name);

    expect(results.every(({ id }) => id !== user.id)).toBe(true);
  });
});
