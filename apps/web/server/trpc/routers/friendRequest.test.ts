import type { Context } from "#server/trpc/context";
import type { TRPCRouter } from "#server/trpc/routers/index";
import type { DecorateRouterRecord } from "@trpc/server/unstable-core-do-not-import";

import {
  createMockAuthSession,
  createMockCaller,
  createMockContext,
  createMockOtherUserCaller,
  createMockUser,
  getMockSession,
} from "#server/trpc/context.test";
import { createCallerFactory } from "#server/trpc/index";
import { blockRouter } from "#server/trpc/routers/block";
import { createFriendship } from "#server/trpc/routers/createFriendship.test";
import { friendRouter } from "#server/trpc/routers/friend";
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
  let friendRequestCaller: DecorateRouterRecord<TRPCRouter["friendRequest"]>;

  beforeAll(async () => {
    mockContext = await createMockContext();
    friendRequestCaller = createCallerFactory(friendRequestRouter)(mockContext);
  });

  afterEach(async () => {
    await mockContext.db.delete(blocksInSocial);
    await mockContext.db.delete(friendsInSocial);
    await mockContext.db.delete(friendRequestsInSocial);
  });

  test("sends friend request", async () => {
    expect.hasAssertions();

    const userId = getMockSession().user.id;
    const senderCaller = await createMockOtherUserCaller(friendRequestRouter, mockContext.db);
    const friendRequest = await senderCaller.sendFriendRequest(userId);

    expect(friendRequest.receiverId).toBe(userId);
  });

  test("sends friend request is idempotent", async () => {
    expect.hasAssertions();

    const userId = getMockSession().user.id;
    const senderCaller = await createMockOtherUserCaller(friendRequestRouter, mockContext.db);
    const firstFriendRequest = await senderCaller.sendFriendRequest(userId);
    const secondFriendRequest = await senderCaller.sendFriendRequest(userId);

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
    const senderAuthSession = await createMockAuthSession(mockContext.db);
    const { user } = senderAuthSession;
    await (await createMockCaller(friendRequestRouter, senderAuthSession)).sendFriendRequest(userId);
    const senderUser = await friendRequestCaller.acceptFriendRequest(user.id);

    expect(senderUser.id).toBe(user.id);
  });

  test("fails to send friend request when already friends", async () => {
    expect.hasAssertions();

    const userId = getMockSession().user.id;
    const senderAuthSession = await createMockAuthSession(mockContext.db);
    const { user } = senderAuthSession;
    const senderCaller = await createMockCaller(friendRequestRouter, senderAuthSession);
    await senderCaller.sendFriendRequest(userId);
    await friendRequestCaller.acceptFriendRequest(user.id);
    const friendshipId = getFriendshipId(userId, user.id);

    await expect(senderCaller.sendFriendRequest(userId)).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new InvalidOperationError(Operation.Create, DatabaseEntityType.FriendRequest, friendshipId).message}]`,
    );
  });

  test("fails accept non-existent friend request", async () => {
    expect.hasAssertions();

    const userId = getMockSession().user.id;
    const senderAuthSession = await createMockAuthSession(mockContext.db);
    const { user } = senderAuthSession;
    const friendshipId = getFriendshipId(userId, user.id);

    await expect(
      (await createMockCaller(friendRequestRouter, senderAuthSession)).acceptFriendRequest(userId),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
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
    const blockerAuthSession = await createMockAuthSession(mockContext.db);
    const { user: blockerUser } = blockerAuthSession;
    await (await createMockCaller(blockRouter, blockerAuthSession)).createBlock(receiverUser.id);

    await expect(friendRequestCaller.sendFriendRequest(blockerUser.id)).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new InvalidOperationError(Operation.Create, DatabaseEntityType.Friend, blockerUser.id).message}]`,
    );
  });

  test("fails to send friend request when block exists (blocker side)", async () => {
    expect.hasAssertions();

    const blockedUser = getMockSession().user;
    const blockerAuthSession = await createMockAuthSession(mockContext.db);
    await (await createMockCaller(blockRouter, blockerAuthSession)).createBlock(blockedUser.id);

    await expect(
      (await createMockCaller(friendRequestRouter, blockerAuthSession)).sendFriendRequest(blockedUser.id),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new InvalidOperationError(Operation.Create, DatabaseEntityType.Friend, blockedUser.id).message}]`,
    );
  });

  test("fails send friend request when they already sent one to you", async () => {
    expect.hasAssertions();

    const userId = getMockSession().user.id;
    const senderAuthSession = await createMockAuthSession(mockContext.db);
    const { user: senderUser } = senderAuthSession;
    await (await createMockCaller(friendRequestRouter, senderAuthSession)).sendFriendRequest(userId);
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
    const user = await createMockUser(mockContext.db);
    const friendshipId = getFriendshipId(userId, user.id);

    await expect(friendRequestCaller.declineFriendRequest(user.id)).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new InvalidOperationError(Operation.Delete, DatabaseEntityType.FriendRequest, friendshipId).message}]`,
    );
  });

  test("fails accept friend request if sender user was deleted", async () => {
    expect.hasAssertions();

    const receiverUser = getMockSession().user;
    const senderAuthSession = await createMockAuthSession(mockContext.db);
    const { user: senderUser } = senderAuthSession;
    await (await createMockCaller(friendRequestRouter, senderAuthSession)).sendFriendRequest(receiverUser.id);
    await mockContext.db.delete(usersInAuth).where(eq(usersInAuth.id, senderUser.id));

    await expect(friendRequestCaller.acceptFriendRequest(senderUser.id)).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new NotFoundError(DatabaseEntityType.User, senderUser.id).message}]`,
    );
  });

  // A decline leaves the request as a tombstone, and the request read returns it, so the client can apply the removal
  test("declines friend request as a tombstone that the request read still returns", async () => {
    expect.hasAssertions();

    const userId = getMockSession().user.id;
    const senderAuthSession = await createMockAuthSession(mockContext.db);
    const { user } = senderAuthSession;
    await (await createMockCaller(friendRequestRouter, senderAuthSession)).sendFriendRequest(userId);
    await friendRequestCaller.declineFriendRequest(user.id);

    const allFriendRequests = await friendRequestCaller.readFriendRequests();

    expect(
      allFriendRequests.map(({ deletedAt, version }) => ({ isDeleted: deletedAt !== null, version })),
    ).toStrictEqual([{ isDeleted: true, version: 1 }]);
  });

  test("sends friend request again after a decline, reviving the request at a higher version", async () => {
    expect.hasAssertions();

    const userId = getMockSession().user.id;
    const senderAuthSession = await createMockAuthSession(mockContext.db);
    const { user } = senderAuthSession;
    const senderCaller = await createMockCaller(friendRequestRouter, senderAuthSession);
    const declinedRequest = await senderCaller.sendFriendRequest(userId);
    await friendRequestCaller.declineFriendRequest(user.id);
    const revivedRequest = await senderCaller.sendFriendRequest(userId);

    expect(revivedRequest.deletedAt).toBeNull();
    expect(revivedRequest.version).toBeGreaterThan(declinedRequest.version);
  });

  test("fails to accept a declined friend request", async () => {
    expect.hasAssertions();

    const userId = getMockSession().user.id;
    const senderAuthSession = await createMockAuthSession(mockContext.db);
    const { user } = senderAuthSession;
    await (await createMockCaller(friendRequestRouter, senderAuthSession)).sendFriendRequest(userId);
    await friendRequestCaller.declineFriendRequest(user.id);
    const friendshipId = getFriendshipId(userId, user.id);

    await expect(friendRequestCaller.acceptFriendRequest(user.id)).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new InvalidOperationError(Operation.Update, DatabaseEntityType.Friend, friendshipId).message}]`,
    );
  });

  // A removed block no longer stands between the two users, so the request is sent
  test("sends friend request once the block between the two users is removed", async () => {
    expect.hasAssertions();

    const receiverUser = getMockSession().user;
    const blockerAuthSession = await createMockAuthSession(mockContext.db);
    const { user: blockerUser } = blockerAuthSession;
    const blockerCaller = await createMockCaller(blockRouter, blockerAuthSession);
    await blockerCaller.createBlock(receiverUser.id);
    await blockerCaller.deleteBlock(receiverUser.id);
    const friendRequest = await friendRequestCaller.sendFriendRequest(blockerUser.id);

    expect(friendRequest.receiverId).toBe(blockerUser.id);
  });

  // A removed friendship no longer stands between the two users, and the request revives the request row the accept left
  test("sends friend request once the friendship between the two users is removed", async () => {
    expect.hasAssertions();

    const { user } = await createFriendship(mockContext);
    await createCallerFactory(friendRouter)(mockContext).deleteFriend(user.id);
    const friendRequest = await friendRequestCaller.sendFriendRequest(user.id);

    expect(friendRequest.receiverId).toBe(user.id);
  });

  test("reads received friend requests", async () => {
    expect.hasAssertions();

    const userId = getMockSession().user.id;
    const senderAuthSession = await createMockAuthSession(mockContext.db);
    const { user } = senderAuthSession;
    await (await createMockCaller(friendRequestRouter, senderAuthSession)).sendFriendRequest(userId);
    const allFriendRequests = await friendRequestCaller.readFriendRequests();

    expect(allFriendRequests.map(({ receiverId, senderId }) => ({ receiverId, senderId }))).toStrictEqual([
      { receiverId: userId, senderId: user.id },
    ]);
  });

  test("reads sent friend requests", async () => {
    expect.hasAssertions();

    const userId = getMockSession().user.id;
    const senderAuthSession = await createMockAuthSession(mockContext.db);
    const { user } = senderAuthSession;
    const senderCaller = await createMockCaller(friendRequestRouter, senderAuthSession);
    await senderCaller.sendFriendRequest(userId);
    const allFriendRequests = await senderCaller.readFriendRequests();

    expect(allFriendRequests.map(({ receiverId, senderId }) => ({ receiverId, senderId }))).toStrictEqual([
      { receiverId: userId, senderId: user.id },
    ]);
  });
});
