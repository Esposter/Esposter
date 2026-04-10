import type { Context } from "@@/server/trpc/context";
import type { TRPCRouter } from "@@/server/trpc/routers";
import type { DecorateRouterRecord } from "@trpc/server/unstable-core-do-not-import";

import { createCallerFactory } from "@@/server/trpc";
import { createMockContext, getMockSession, mockSessionOnce } from "@@/server/trpc/context.test";
import { friendRequestRouter } from "@@/server/trpc/routers/friendRequest";
import { withAsyncIterator } from "@@/server/trpc/routers/testUtils.test";
import { blocks, DatabaseEntityType, friendRequests, friends } from "@esposter/db-schema";
import { ID_SEPARATOR, InvalidOperationError, Operation, takeOne } from "@esposter/shared";
import { afterEach, assert, beforeAll, describe, expect, test } from "vitest";

describe("friendRequest", () => {
  let mockContext: Context;
  let friendRequestCaller: DecorateRouterRecord<TRPCRouter["friendRequest"]>;

  beforeAll(async () => {
    mockContext = await createMockContext();
    friendRequestCaller = createCallerFactory(friendRequestRouter)(mockContext);
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
    // Session=user: sends request to default user, returns the friend request with relations
    const friendRequest = await friendRequestCaller.sendFriendRequest(userId);

    expect(friendRequest.receiverId).toBe(userId);
  });

  test("sends friend request is idempotent", async () => {
    expect.hasAssertions();

    const userId = getMockSession().user.id;
    const { user } = await mockSessionOnce(mockContext.db);
    const friendRequest1 = await friendRequestCaller.sendFriendRequest(userId);
    await mockSessionOnce(mockContext.db, user);
    const friendRequest2 = await friendRequestCaller.sendFriendRequest(userId);

    expect(friendRequest1.id).toBe(friendRequest2.id);
  });

  test("fails send friend request to self", async () => {
    expect.hasAssertions();

    const userId = getMockSession().user.id;

    await expect(friendRequestCaller.sendFriendRequest(userId)).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new InvalidOperationError(Operation.Create, DatabaseEntityType.Friend, userId).message}]`,
    );
  });

  test("accepts friend request", async () => {
    expect.hasAssertions();

    const userId = getMockSession().user.id;
    const { user } = await mockSessionOnce(mockContext.db);
    // Session=user: sends request to default user
    await friendRequestCaller.sendFriendRequest(userId);
    // Session=default: accepts request from user
    const accepted = await friendRequestCaller.acceptFriendRequest(user.id);

    expect(accepted.senderId).toBe(user.id);
    expect(accepted.receiverId).toBe(userId);
  });

  test("fails to send friend request when already friends", async () => {
    expect.hasAssertions();

    const userId = getMockSession().user.id;
    const { user } = await mockSessionOnce(mockContext.db);
    // Session=user: sends request to default user
    await friendRequestCaller.sendFriendRequest(userId);
    // Session=default: accepts request from user
    await friendRequestCaller.acceptFriendRequest(user.id);
    // Session=user: tries to send again to default user
    await mockSessionOnce(mockContext.db, user);
    const friendshipId = [userId, user.id].toSorted().join(ID_SEPARATOR);

    await expect(friendRequestCaller.sendFriendRequest(userId)).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new InvalidOperationError(Operation.Create, DatabaseEntityType.FriendRequest, friendshipId).message}]`,
    );
  });

  test("fails accept non-existent friend request", async () => {
    expect.hasAssertions();

    const userId = getMockSession().user.id;
    const { user } = await mockSessionOnce(mockContext.db);
    const id = [userId, user.id].toSorted().join(ID_SEPARATOR);

    // Session=user: no request exists, try to accept from default user
    await expect(friendRequestCaller.acceptFriendRequest(userId)).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new InvalidOperationError(Operation.Update, DatabaseEntityType.Friend, id).message}]`,
    );
  });

  test("declines friend request", async () => {
    expect.hasAssertions();

    const userId = getMockSession().user.id;
    const { user } = await mockSessionOnce(mockContext.db);
    // Session=user: sends request to default user
    await friendRequestCaller.sendFriendRequest(userId);
    // Session=default: declines
    await friendRequestCaller.declineFriendRequest(user.id);

    const allFriendRequests = await friendRequestCaller.readFriendRequests();

    expect(allFriendRequests).toHaveLength(0);
  });

  test("reads received friend requests", async () => {
    expect.hasAssertions();

    const userId = getMockSession().user.id;
    const { user } = await mockSessionOnce(mockContext.db);
    // Session=user: sends request to default user
    await friendRequestCaller.sendFriendRequest(userId);
    // Session=default: reads friend requests
    const allFriendRequests = await friendRequestCaller.readFriendRequests();
    const receivedFriendRequests = allFriendRequests.filter(({ receiverId }) => receiverId === userId);

    expect(receivedFriendRequests).toHaveLength(1);
    expect(takeOne(receivedFriendRequests).senderId).toBe(user.id);
  });

  test("reads sent friend requests", async () => {
    expect.hasAssertions();

    const userId = getMockSession().user.id;
    const { user } = await mockSessionOnce(mockContext.db);
    // Session=user: sends request to default user
    await friendRequestCaller.sendFriendRequest(userId);
    // Session=user again: reads sent friend requests
    await mockSessionOnce(mockContext.db, user);
    const allFriendRequests = await friendRequestCaller.readFriendRequests();
    const sentFriendRequests = allFriendRequests.filter(({ senderId }) => senderId === user.id);

    expect(sentFriendRequests).toHaveLength(1);
    expect(takeOne(sentFriendRequests).receiverId).toBe(userId);
  });

  test("on send friend request notifies receiver", async () => {
    expect.hasAssertions();

    const receiverUser = getMockSession().user;
    const onSendFriendRequest = await friendRequestCaller.onSendFriendRequest();
    const { user: senderUser } = await mockSessionOnce(mockContext.db);
    const data = await withAsyncIterator(
      () => onSendFriendRequest,
      async (iterator) => {
        const [result] = await Promise.all([iterator.next(), friendRequestCaller.sendFriendRequest(receiverUser.id)]);
        return result;
      },
    );

    assert(!data.done);

    expect(data.value.senderId).toBe(senderUser.id);
    expect(data.value.receiverId).toBe(receiverUser.id);
    expect(data.value.sender.id).toBe(senderUser.id);
  });

  test("on accept friend request notifies sender", async () => {
    expect.hasAssertions();

    const receiverUser = getMockSession().user;
    const { user: senderUser } = await mockSessionOnce(mockContext.db);
    // Sender sends request to receiver
    await friendRequestCaller.sendFriendRequest(receiverUser.id);
    // Sender subscribes to be notified when receiver accepts
    await mockSessionOnce(mockContext.db, senderUser);
    const onAcceptFriendRequest = await friendRequestCaller.onAcceptFriendRequest();
    const data = await withAsyncIterator(
      () => onAcceptFriendRequest,
      async (iterator) => {
        const [result] = await Promise.all([iterator.next(), friendRequestCaller.acceptFriendRequest(senderUser.id)]);
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
    await friendRequestCaller.sendFriendRequest(receiverUser.id);
    // Sender subscribes to be notified when receiver declines
    await mockSessionOnce(mockContext.db, senderUser);
    const onDeclineFriendRequest = await friendRequestCaller.onDeclineFriendRequest();
    const data = await withAsyncIterator(
      () => onDeclineFriendRequest,
      async (iterator) => {
        const [result] = await Promise.all([iterator.next(), friendRequestCaller.declineFriendRequest(senderUser.id)]);
        return result;
      },
    );

    assert(!data.done);

    expect(data.value).toBe(receiverUser.id);
  });
});
