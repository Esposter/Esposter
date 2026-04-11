import type { Context } from "@@/server/trpc/context";
import type { TRPCRouter } from "@@/server/trpc/routers";
import type { DecorateRouterRecord } from "@trpc/server/unstable-core-do-not-import";

import { createCallerFactory } from "@@/server/trpc";
import { createMockContext, getMockSession, mockSessionOnce } from "@@/server/trpc/context.test";
import { blockRouter } from "@@/server/trpc/routers/block";
import { friendRouter } from "@@/server/trpc/routers/friend";
import { friendRequestRouter } from "@@/server/trpc/routers/friendRequest";
import { blocks, DatabaseEntityType, friendRequests, friends } from "@esposter/db-schema";
import { InvalidOperationError, Operation, takeOne } from "@esposter/shared";
import { afterEach, beforeAll, describe, expect, test } from "vitest";

describe("block", () => {
  let mockContext: Context;
  let blockCaller: DecorateRouterRecord<TRPCRouter["block"]>;
  let friendCaller: DecorateRouterRecord<TRPCRouter["friend"]>;
  let friendRequestCaller: DecorateRouterRecord<TRPCRouter["friendRequest"]>;

  beforeAll(async () => {
    mockContext = await createMockContext();
    blockCaller = createCallerFactory(blockRouter)(mockContext);
    friendCaller = createCallerFactory(friendRouter)(mockContext);
    friendRequestCaller = createCallerFactory(friendRequestRouter)(mockContext);
  });

  afterEach(async () => {
    await mockContext.db.delete(blocks);
    await mockContext.db.delete(friends);
    await mockContext.db.delete(friendRequests);
  });

  const setupFriendship = async () => {
    const userId = getMockSession().user.id;
    const { user } = await mockSessionOnce(mockContext.db);
    await friendRequestCaller.sendFriendRequest(userId);
    await friendRequestCaller.acceptFriendRequest(user.id);
    return { user, userId };
  };

  test("blocks user", async () => {
    expect.hasAssertions();

    const { user } = await mockSessionOnce(mockContext.db);
    getMockSession();
    const blockedUser = await blockCaller.blockUser(user.id);

    expect(blockedUser.id).toBe(user.id);
  });

  test("blocks user and removes friendship", async () => {
    expect.hasAssertions();

    const { user } = await setupFriendship();
    await blockCaller.blockUser(user.id);
    const friendList = await friendCaller.readFriends();

    expect(friendList).toHaveLength(0);
  });

  test("fails to block self", async () => {
    expect.hasAssertions();

    const userId = getMockSession().user.id;

    await expect(blockCaller.blockUser(userId)).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new InvalidOperationError(Operation.Create, DatabaseEntityType.Block, userId).message}]`,
    );
  });

  test("fails to block non-existent user", async () => {
    expect.hasAssertions();

    const userId = crypto.randomUUID();

    await expect(blockCaller.blockUser(userId)).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new InvalidOperationError(Operation.Read, DatabaseEntityType.Block, userId).message}]`,
    );
  });

  test("blocks user twice (idempotent)", async () => {
    expect.hasAssertions();

    const { user } = await mockSessionOnce(mockContext.db);
    getMockSession();
    await blockCaller.blockUser(user.id);
    const blockedUser = await blockCaller.blockUser(user.id);

    expect(blockedUser.id).toBe(user.id);
  });

  test("reads blocked users", async () => {
    expect.hasAssertions();

    const { user } = await mockSessionOnce(mockContext.db);
    getMockSession();
    await blockCaller.blockUser(user.id);
    const blockedUsers = await blockCaller.readBlockedUsers();

    expect(blockedUsers).toHaveLength(1);
    expect(takeOne(blockedUsers).id).toBe(user.id);
  });

  test("unblocks user", async () => {
    expect.hasAssertions();

    const { user } = await mockSessionOnce(mockContext.db);
    getMockSession();
    await blockCaller.blockUser(user.id);
    await blockCaller.unblockUser(user.id);
    const blockedUsers = await blockCaller.readBlockedUsers();

    expect(blockedUsers).toHaveLength(0);
  });

  test("fails to unblock self", async () => {
    expect.hasAssertions();

    const userId = getMockSession().user.id;

    await expect(blockCaller.unblockUser(userId)).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new InvalidOperationError(Operation.Delete, DatabaseEntityType.Block, userId).message}]`,
    );
  });

  test("fails to unblock non-existent block", async () => {
    expect.hasAssertions();

    const userId = crypto.randomUUID();

    await expect(blockCaller.unblockUser(userId)).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new InvalidOperationError(Operation.Delete, DatabaseEntityType.Block, userId).message}]`,
    );
  });

  test("search excludes blocked users", async () => {
    expect.hasAssertions();

    const { user: blockedUser } = await mockSessionOnce(mockContext.db);
    getMockSession();
    await blockCaller.blockUser(blockedUser.id);
    const results = await friendCaller.searchUsers(blockedUser.name);

    expect(results.every(({ id }) => id !== blockedUser.id)).toBe(true);
  });

  test("search excludes users who blocked you", async () => {
    expect.hasAssertions();

    const user = getMockSession().user;
    const { user: blockerUser } = await mockSessionOnce(mockContext.db);
    await blockCaller.blockUser(user.id);
    await mockSessionOnce(mockContext.db, user);

    const results = await friendCaller.searchUsers(blockerUser.name);

    expect(results.every(({ id }) => id !== blockerUser.id)).toBe(true);
  });
});
