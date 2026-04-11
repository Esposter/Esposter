import type { Context } from "@@/server/trpc/context";
import type { TRPCRouter } from "@@/server/trpc/routers";
import type { DecorateRouterRecord } from "@trpc/server/unstable-core-do-not-import";

import { getFriendshipId } from "@@/server/services/friend/getFriendshipId";
import { createCallerFactory } from "@@/server/trpc";
import { createMockContext, getMockSession, mockSessionOnce } from "@@/server/trpc/context.test";
import { blockRouter } from "@@/server/trpc/routers/block";
import { friendRequestRouter } from "@@/server/trpc/routers/friendRequest";
import { withAsyncIterator } from "@@/server/trpc/routers/testUtils.test";
import { blocks, DatabaseEntityType, friendRequests, friends, users } from "@esposter/db-schema";
import { InvalidOperationError, Operation, takeOne } from "@esposter/shared";
import { eq } from "drizzle-orm";
import { afterEach, assert, beforeAll, describe, expect, test } from "vitest";

describe("friendRequest", () => {
  let mockContext: Context;
  let blockCaller: DecorateRouterRecord<TRPCRouter["block"]>;
  let friendRequestCaller: DecorateRouterRecord<TRPCRouter["friendRequest"]>;

  beforeAll(async () => {
    mockContext = await createMockContext();
    blockCaller = createCallerFactory(blockRouter)(mockContext);
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
    await friendRequestCaller.sendFriendRequest(userId);
    const senderUser = await friendRequestCaller.acceptFriendRequest(user.id);

    expect(senderUser.id).toBe(user.id);
  });

  test("fails to send friend request when already friends", async () => {
    expect.hasAssertions();

    const userId = getMockSession().user.id;
    const { user } = await mockSessionOnce(mockContext.db);
    await friendRequestCaller.sendFriendRequest(userId);
    await friendRequestCaller.acceptFriendRequest(user.id);
    await mockSessionOnce(mockContext.db, user);
    const friendshipId = getFriendshipId(userId, user.id);

    await expect(friendRequestCaller.sendFriendRequest(userId)).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new InvalidOperationError(Operation.Create, DatabaseEntityType.FriendRequest, friendshipId).message}]`,
    );
  });

  test("fails accept non-existent friend request", async () => {
    expect.hasAssertions();

    const userId = getMockSession().user.id;
    const { user } = await mockSessionOnce(mockContext.db);
    const friendshipId = getFriendshipId(userId, user.id);

    await expect(friendRequestCaller.acceptFriendRequest(userId)).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new InvalidOperationError(Operation.Update, DatabaseEntityType.Friend, friendshipId).message}]`,
    );
  });

  test("fails send friend request to non-existent user", async () => {
    expect.hasAssertions();

    const userId = crypto.randomUUID();

    await expect(friendRequestCaller.sendFriendRequest(userId)).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new InvalidOperationError(Operation.Read, DatabaseEntityType.Friend, userId).message}]`,
    );
  });

  test("fails to send friend request when you are blocked", async () => {
    expect.hasAssertions();

    const receiverUser = getMockSession().user;
    const { user: blockerUser } = await mockSessionOnce(mockContext.db);
    await blockCaller.blockUser(receiverUser.id);
    getMockSession();

    await expect(friendRequestCaller.sendFriendRequest(blockerUser.id)).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new InvalidOperationError(Operation.Create, DatabaseEntityType.Friend, blockerUser.id).message}]`,
    );
  });

  test("fails to send friend request when block exists (blocker side)", async () => {
    expect.hasAssertions();

    const blockedUser = getMockSession().user;
    const { user: blockerUser } = await mockSessionOnce(mockContext.db);
    await blockCaller.blockUser(blockedUser.id);
    await mockSessionOnce(mockContext.db, blockerUser);

    await expect(friendRequestCaller.sendFriendRequest(blockedUser.id)).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new InvalidOperationError(Operation.Create, DatabaseEntityType.Friend, blockedUser.id).message}]`,
    );
  });

  test("fails send friend request when they already sent one to you", async () => {
    expect.hasAssertions();

    const userId = getMockSession().user.id;
    const { user: senderUser } = await mockSessionOnce(mockContext.db);
    await friendRequestCaller.sendFriendRequest(userId);
    const friendshipId = getFriendshipId(userId, senderUser.id);

    await expect(friendRequestCaller.sendFriendRequest(senderUser.id)).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new InvalidOperationError(Operation.Create, DatabaseEntityType.FriendRequest, friendshipId).message}]`,
    );
  });

  test("fails to decline self friend request", async () => {
    expect.hasAssertions();

    const userId = getMockSession().user.id;

    await expect(friendRequestCaller.declineFriendRequest(userId)).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new InvalidOperationError(Operation.Delete, DatabaseEntityType.FriendRequest, userId).message}]`,
    );
  });

  test("fails to decline non-existent friend request", async () => {
    expect.hasAssertions();

    const userId = getMockSession().user.id;
    const { user } = await mockSessionOnce(mockContext.db);
    const friendshipId = getFriendshipId(userId, user.id);
    getMockSession();

    await expect(friendRequestCaller.declineFriendRequest(user.id)).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new InvalidOperationError(Operation.Delete, DatabaseEntityType.FriendRequest, friendshipId).message}]`,
    );
  });

  test("fails accept friend request if sender user was deleted", async () => {
    expect.hasAssertions();

    const receiverUser = getMockSession().user;
    const { user: senderUser } = await mockSessionOnce(mockContext.db);
    await friendRequestCaller.sendFriendRequest(receiverUser.id);
    await mockContext.db.delete(users).where(eq(users.id, senderUser.id));
    getMockSession();

    await expect(friendRequestCaller.acceptFriendRequest(senderUser.id)).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new InvalidOperationError(Operation.Update, DatabaseEntityType.Friend, getFriendshipId(senderUser.id, receiverUser.id)).message}]`,
    );
  });

  test("declines friend request", async () => {
    expect.hasAssertions();

    const userId = getMockSession().user.id;
    const { user } = await mockSessionOnce(mockContext.db);
    await friendRequestCaller.sendFriendRequest(userId);
    await friendRequestCaller.declineFriendRequest(user.id);

    const allFriendRequests = await friendRequestCaller.readFriendRequests();

    expect(allFriendRequests).toHaveLength(0);
  });

  test("reads received friend requests", async () => {
    expect.hasAssertions();

    const userId = getMockSession().user.id;
    const { user } = await mockSessionOnce(mockContext.db);
    await friendRequestCaller.sendFriendRequest(userId);
    const allFriendRequests = await friendRequestCaller.readFriendRequests();
    const receivedFriendRequests = allFriendRequests.filter(({ receiverId }) => receiverId === userId);

    expect(receivedFriendRequests).toHaveLength(1);
    expect(takeOne(receivedFriendRequests).senderId).toBe(user.id);
  });

  test("reads sent friend requests", async () => {
    expect.hasAssertions();

    const userId = getMockSession().user.id;
    const { user } = await mockSessionOnce(mockContext.db);
    await friendRequestCaller.sendFriendRequest(userId);
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
    await friendRequestCaller.sendFriendRequest(receiverUser.id);
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
    await friendRequestCaller.sendFriendRequest(receiverUser.id);
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
