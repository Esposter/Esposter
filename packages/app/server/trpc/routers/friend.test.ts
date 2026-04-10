import type { Context } from "@@/server/trpc/context";
import type { TRPCRouter } from "@@/server/trpc/routers";
import type { DecorateRouterRecord } from "@trpc/server/unstable-core-do-not-import";

import { createCallerFactory } from "@@/server/trpc";
import { createMockContext, getMockSession, mockSessionOnce } from "@@/server/trpc/context.test";
import { friendRouter } from "@@/server/trpc/routers/friend";
import { withAsyncIterator } from "@@/server/trpc/routers/testUtils.test";
import { blocks, DatabaseEntityType, friendRequests, friends } from "@esposter/db-schema";
import { ID_SEPARATOR, InvalidOperationError, Operation, takeOne } from "@esposter/shared";
import { afterEach, assert, beforeAll, describe, expect, test } from "vitest";

describe("friend", () => {
  let mockContext: Context;
  let caller: DecorateRouterRecord<TRPCRouter["friend"]>;

  beforeAll(async () => {
    mockContext = await createMockContext();
    caller = createCallerFactory(friendRouter)(mockContext);
  });

  afterEach(async () => {
    await mockContext.db.delete(blocks);
    await mockContext.db.delete(friends);
    await mockContext.db.delete(friendRequests);
  });

  test("sends friend request", async () => {
    expect.hasAssertions();

    const userId = getMockSession().user.id;
    await mockSessionOnce(mockContext.db);
    // Session=user: sends request to default user, returns the receiver
    const receiver = await caller.sendFriendRequest(userId);

    expect(receiver.id).toBe(userId);
  });

  test("sends friend request is idempotent", async () => {
    expect.hasAssertions();

    const userId = getMockSession().user.id;
    const { user } = await mockSessionOnce(mockContext.db);
    const friend1 = await caller.sendFriendRequest(userId);
    await mockSessionOnce(mockContext.db, user);
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
    // Session=user: sends request to default user
    await caller.sendFriendRequest(userId);
    // Session=default: accepts request from user
    const accepted = await caller.acceptFriendRequest(user.id);

    expect(accepted.senderId).toBe(user.id);
    expect(accepted.receiverId).toBe(userId);
  });

  test("fails accept non-existent friend request", async () => {
    expect.hasAssertions();

    const userId = getMockSession().user.id;
    const { user } = await mockSessionOnce(mockContext.db);
    const id = [userId, user.id].toSorted().join(ID_SEPARATOR);

    // Session=user: no request exists, try to accept from default user
    await expect(caller.acceptFriendRequest(userId)).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new InvalidOperationError(Operation.Update, DatabaseEntityType.Friend, id).message}]`,
    );
  });

  test("declines friend request", async () => {
    expect.hasAssertions();

    const userId = getMockSession().user.id;
    const { user } = await mockSessionOnce(mockContext.db);
    // Session=user: sends request to default user
    await caller.sendFriendRequest(userId);
    // Session=default: declines
    await caller.declineFriendRequest(user.id);

    const pendingRequests = await caller.readPendingRequests();

    expect(pendingRequests).toHaveLength(0);
  });

  test("deletes friend", async () => {
    expect.hasAssertions();

    const userId = getMockSession().user.id;
    const { user } = await mockSessionOnce(mockContext.db);
    // Session=user: sends; session=default: accepts; then deletes
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
    // Session=user: sends; session=default: accepts
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
    // Session=user: sends; session=default: accepts
    await caller.sendFriendRequest(userId);
    await caller.acceptFriendRequest(user.id);

    // Session=user: reads their own friends list
    await mockSessionOnce(mockContext.db, user);
    const friendList = await caller.readFriends();

    expect(friendList).toHaveLength(1);
    expect(takeOne(friendList).id).toBe(userId);
  });

  test("reads pending requests", async () => {
    expect.hasAssertions();

    const userId = getMockSession().user.id;
    const { user } = await mockSessionOnce(mockContext.db);
    // Session=user: sends request to default user
    await caller.sendFriendRequest(userId);
    // Session=default: reads pending
    const pendingRequests = await caller.readPendingRequests();

    expect(pendingRequests).toHaveLength(1);
    expect(takeOne(pendingRequests).id).toBe(user.id);
  });

  test("reads sent requests", async () => {
    expect.hasAssertions();

    const userId = getMockSession().user.id;
    const { user } = await mockSessionOnce(mockContext.db);
    // Session=user: sends request to default user
    await caller.sendFriendRequest(userId);
    // Session=user again: reads sent requests
    await mockSessionOnce(mockContext.db, user);
    const sentRequests = await caller.readSentRequests();

    expect(sentRequests).toHaveLength(1);
    expect(takeOne(sentRequests).id).toBe(userId);
  });

  test("searches users by name", async () => {
    expect.hasAssertions();

    const user = getMockSession().user;
    // Session=newUser: search for default user by name
    await mockSessionOnce(mockContext.db);
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

  test("blocks user and removes friendship", async () => {
    expect.hasAssertions();

    const userId = getMockSession().user.id;
    const { user } = await mockSessionOnce(mockContext.db);
    await caller.sendFriendRequest(userId);
    await caller.acceptFriendRequest(user.id);

    const blockedUser = await caller.blockUser(user.id);
    const friendList = await caller.readFriends();

    expect(blockedUser.id).toBe(user.id);
    expect(friendList).toHaveLength(0);
  });

  test("fails to block self", async () => {
    expect.hasAssertions();

    const userId = getMockSession().user.id;

    await expect(caller.blockUser(userId)).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new InvalidOperationError(Operation.Create, DatabaseEntityType.Block, userId).message}]`,
    );
  });

  test("reads blocked users", async () => {
    expect.hasAssertions();

    const { user } = await mockSessionOnce(mockContext.db);
    await caller.blockUser(user.id);

    const blockedUsers = await caller.readBlockedUsers();

    expect(blockedUsers).toHaveLength(1);
    expect(takeOne(blockedUsers).id).toBe(user.id);
  });

  test("unblocks user", async () => {
    expect.hasAssertions();

    const { user } = await mockSessionOnce(mockContext.db);
    await caller.blockUser(user.id);
    await caller.unblockUser(user.id);

    const blockedUsers = await caller.readBlockedUsers();

    expect(blockedUsers).toHaveLength(0);
  });

  test("search excludes blocked users", async () => {
    expect.hasAssertions();

    const { user: blockedUser } = await mockSessionOnce(mockContext.db);
    await caller.blockUser(blockedUser.id);

    const results = await caller.searchUsers(blockedUser.name);

    expect(results.every(({ id }) => id !== blockedUser.id)).toBe(true);
  });

  test("fails to send friend request when block exists", async () => {
    expect.hasAssertions();

    const userId = getMockSession().user.id;
    const { user } = await mockSessionOnce(mockContext.db);
    // User blocks the default user
    await caller.blockUser(userId);
    // Default user tries to send request to user — blocked in either direction
    const receiverId = user.id;

    await expect(caller.sendFriendRequest(receiverId)).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new InvalidOperationError(Operation.Create, DatabaseEntityType.Friend, receiverId).message}]`,
    );
  });

  test("on send friend request notifies receiver", async () => {
    expect.hasAssertions();

    const receiverUser = getMockSession().user;
    const onSendFriendRequest = await caller.onSendFriendRequest();
    const { user: senderUser } = await mockSessionOnce(mockContext.db);
    const data = await withAsyncIterator(
      () => onSendFriendRequest,
      async (iterator) => {
        const [result] = await Promise.all([iterator.next(), caller.sendFriendRequest(receiverUser.id)]);
        return result;
      },
    );

    assert(!data.done);

    expect(data.value.id).toBe(senderUser.id);
  });

  test("on accept friend request notifies sender", async () => {
    expect.hasAssertions();

    const receiverUser = getMockSession().user;
    const { user: senderUser } = await mockSessionOnce(mockContext.db);
    // Sender sends request to receiver
    await caller.sendFriendRequest(receiverUser.id);
    // Sender subscribes to be notified when receiver accepts
    await mockSessionOnce(mockContext.db, senderUser);
    const onAcceptFriendRequest = await caller.onAcceptFriendRequest();
    const data = await withAsyncIterator(
      () => onAcceptFriendRequest,
      async (iterator) => {
        const [result] = await Promise.all([iterator.next(), caller.acceptFriendRequest(senderUser.id)]);
        return result;
      },
    );

    assert(!data.done);

    expect(data.value.id).toBe(receiverUser.id);
  });

  test("on decline friend request notifies sender", async () => {
    expect.hasAssertions();

    const receiverUser = getMockSession().user;
    const { user: senderUser } = await mockSessionOnce(mockContext.db);
    // Sender sends request to receiver
    await caller.sendFriendRequest(receiverUser.id);
    // Sender subscribes to be notified when receiver declines
    await mockSessionOnce(mockContext.db, senderUser);
    const onDeclineFriendRequest = await caller.onDeclineFriendRequest();
    const data = await withAsyncIterator(
      () => onDeclineFriendRequest,
      async (iterator) => {
        const [result] = await Promise.all([iterator.next(), caller.declineFriendRequest(senderUser.id)]);
        return result;
      },
    );

    assert(!data.done);

    expect(data.value).toBe(receiverUser.id);
  });

  test("on delete friend notifies the other party", async () => {
    expect.hasAssertions();

    const senderPayload = getMockSession();
    const { user: receiverUser } = await mockSessionOnce(mockContext.db);
    // ReceiverUser sends to sender; sender accepts
    await caller.sendFriendRequest(senderPayload.user.id);
    await caller.acceptFriendRequest(receiverUser.id);
    // Sender subscribes then receiverUser deletes
    const onDeleteFriend = await caller.onDeleteFriend();
    await mockSessionOnce(mockContext.db, receiverUser);
    const data = await withAsyncIterator(
      () => onDeleteFriend,
      async (iterator) => {
        const [result] = await Promise.all([iterator.next(), caller.deleteFriend(senderPayload.user.id)]);
        return result;
      },
    );

    assert(!data.done);

    expect(data.value).toBe(receiverUser.id);
  });
});
