import type { Context } from "#server/trpc/context";
import type { TRPCRouter } from "#server/trpc/routers";
import type { DecorateRouterRecord } from "@trpc/server/unstable-core-do-not-import";

import { userObjectCalls } from "#server/composables/realtime/useUserObject.test";
import { createCallerFactory } from "#server/trpc";
import { consumeMockSessionOnce, createMockContext, getMockSession, mockSessionOnce } from "#server/trpc/context.test";
import { blockRouter } from "#server/trpc/routers/block";
import { friendRequestRouter } from "#server/trpc/routers/friendRequest";
import {
  blocksInSocial,
  DatabaseEntityType,
  friendRequestsInSocial,
  friendsInSocial,
  usersInAuth,
} from "@esposter/db-schema";
import { getFriendshipId, InvalidOperationError, NotFoundError, Operation } from "@esposter/shared";
import { eq } from "drizzle-orm";
import { v7 } from "uuid";
import { afterEach, beforeAll, describe, expect, test } from "vitest";

describe("friendRequestRouter", () => {
  let mockContext: Context;
  let blockCaller: DecorateRouterRecord<TRPCRouter["block"]>;
  let friendRequestCaller: DecorateRouterRecord<TRPCRouter["friendRequest"]>;

  beforeAll(async () => {
    mockContext = await createMockContext();
    blockCaller = createCallerFactory(blockRouter)(mockContext);
    friendRequestCaller = createCallerFactory(friendRequestRouter)(mockContext);
  });

  afterEach(async () => {
    await mockContext.db.delete(blocksInSocial);
    await mockContext.db.delete(friendsInSocial);
    await mockContext.db.delete(friendRequestsInSocial);
    userObjectCalls.length = 0;
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
    const firstFriendRequest = await friendRequestCaller.sendFriendRequest(userId);
    await mockSessionOnce(mockContext.db, user);
    const secondFriendRequest = await friendRequestCaller.sendFriendRequest(userId);

    expect(firstFriendRequest.id).toBe(secondFriendRequest.id);
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

    const userId = v7();

    await expect(friendRequestCaller.sendFriendRequest(userId)).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new NotFoundError(DatabaseEntityType.User, userId).message}]`,
    );
  });

  test("fails to send friend request when you are blocked", async () => {
    expect.hasAssertions();

    const receiverUser = getMockSession().user;
    const { user: blockerUser } = await mockSessionOnce(mockContext.db);
    await blockCaller.createBlock(receiverUser.id);
    await consumeMockSessionOnce();

    await expect(friendRequestCaller.sendFriendRequest(blockerUser.id)).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new InvalidOperationError(Operation.Create, DatabaseEntityType.Friend, blockerUser.id).message}]`,
    );
  });

  test("fails to send friend request when block exists (blocker side)", async () => {
    expect.hasAssertions();

    const blockedUser = getMockSession().user;
    const { user: blockerUser } = await mockSessionOnce(mockContext.db);
    await blockCaller.createBlock(blockedUser.id);
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
    await consumeMockSessionOnce();

    await expect(friendRequestCaller.declineFriendRequest(user.id)).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new InvalidOperationError(Operation.Delete, DatabaseEntityType.FriendRequest, friendshipId).message}]`,
    );
  });

  test("fails accept friend request if sender user was deleted", async () => {
    expect.hasAssertions();

    const receiverUser = getMockSession().user;
    const { user: senderUser } = await mockSessionOnce(mockContext.db);
    await friendRequestCaller.sendFriendRequest(receiverUser.id);
    await mockContext.db.delete(usersInAuth).where(eq(usersInAuth.id, senderUser.id));
    await consumeMockSessionOnce();

    await expect(friendRequestCaller.acceptFriendRequest(senderUser.id)).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new NotFoundError(DatabaseEntityType.User, senderUser.id).message}]`,
    );
  });

  test("declines friend request", async () => {
    expect.hasAssertions();

    const userId = getMockSession().user.id;
    const { user } = await mockSessionOnce(mockContext.db);
    await friendRequestCaller.sendFriendRequest(userId);
    await friendRequestCaller.declineFriendRequest(user.id);

    const allFriendRequests = await friendRequestCaller.readFriendRequests();

    expect(allFriendRequests).toStrictEqual([]);
  });

  test("reads received friend requests", async () => {
    expect.hasAssertions();

    const userId = getMockSession().user.id;
    const { user } = await mockSessionOnce(mockContext.db);
    await friendRequestCaller.sendFriendRequest(userId);
    const allFriendRequests = await friendRequestCaller.readFriendRequests();

    expect(allFriendRequests.map(({ receiverId, senderId }) => ({ receiverId, senderId }))).toStrictEqual([
      { receiverId: userId, senderId: user.id },
    ]);
  });

  test("reads sent friend requests", async () => {
    expect.hasAssertions();

    const userId = getMockSession().user.id;
    const { user } = await mockSessionOnce(mockContext.db);
    await friendRequestCaller.sendFriendRequest(userId);
    await mockSessionOnce(mockContext.db, user);
    const allFriendRequests = await friendRequestCaller.readFriendRequests();

    expect(allFriendRequests.map(({ receiverId, senderId }) => ({ receiverId, senderId }))).toStrictEqual([
      { receiverId: userId, senderId: user.id },
    ]);
  });

  test("sends the friend request to both people's objects", async () => {
    expect.hasAssertions();

    const receiverUser = getMockSession().user;
    const { user: senderUser } = await mockSessionOnce(mockContext.db);
    const friendRequest = await friendRequestCaller.sendFriendRequest(receiverUser.id);

    expect(userObjectCalls).toStrictEqual([
      { args: [friendRequest], method: "sendFriendRequest", userId: receiverUser.id },
      { args: [friendRequest], method: "sendFriendRequest", userId: senderUser.id },
    ]);
  });

  test("sends the accepted friend request to both people's objects", async () => {
    expect.hasAssertions();

    const receiverUser = getMockSession().user;
    const { user: senderUser } = await mockSessionOnce(mockContext.db);
    await friendRequestCaller.sendFriendRequest(receiverUser.id);
    const acceptedSenderUser = await friendRequestCaller.acceptFriendRequest(senderUser.id);
    const acceptance = {
      receiverUser: expect.objectContaining({ id: receiverUser.id }),
      senderUser: acceptedSenderUser,
    };

    expect(userObjectCalls.filter(({ method }) => method === "acceptFriendRequest")).toStrictEqual([
      { args: [acceptance], method: "acceptFriendRequest", userId: senderUser.id },
      { args: [acceptance], method: "acceptFriendRequest", userId: receiverUser.id },
    ]);
  });

  test("sends the declined friend request to both people's objects", async () => {
    expect.hasAssertions();

    const receiverUser = getMockSession().user;
    const { user: senderUser } = await mockSessionOnce(mockContext.db);
    await friendRequestCaller.sendFriendRequest(receiverUser.id);
    await friendRequestCaller.declineFriendRequest(senderUser.id);

    const declinedFriendRequest = { receiverId: receiverUser.id, senderId: senderUser.id };

    expect(userObjectCalls.filter(({ method }) => method === "declineFriendRequest")).toStrictEqual([
      { args: [declinedFriendRequest], method: "declineFriendRequest", userId: senderUser.id },
      { args: [declinedFriendRequest], method: "declineFriendRequest", userId: receiverUser.id },
    ]);
  });
});
