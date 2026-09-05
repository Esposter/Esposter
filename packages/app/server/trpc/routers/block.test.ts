import type { Context } from "@@/server/trpc/context";
import type { TRPCRouter } from "@@/server/trpc/routers";
import type { DecorateRouterRecord } from "@trpc/server/unstable-core-do-not-import";

import { createCallerFactory } from "@@/server/trpc";
import { createMockContext, createMockUser, getMockSession, mockSessionOnce } from "@@/server/trpc/context.test";
import { blockRouter } from "@@/server/trpc/routers/block";
import { createFriendship } from "@@/server/trpc/routers/createFriendship.test";
import { friendRouter } from "@@/server/trpc/routers/friend";
import { blocks, DatabaseEntityType, friendRequests, friends } from "@esposter/db-schema";
import { InvalidOperationError, NotFoundError, Operation, takeOne } from "@esposter/shared";
import { afterEach, beforeAll, describe, expect, test } from "vitest";

describe("blockRouter", () => {
  let mockContext: Context;
  let blockCaller: DecorateRouterRecord<TRPCRouter["block"]>;
  let friendCaller: DecorateRouterRecord<TRPCRouter["friend"]>;

  beforeAll(async () => {
    mockContext = await createMockContext();
    blockCaller = createCallerFactory(blockRouter)(mockContext);
    friendCaller = createCallerFactory(friendRouter)(mockContext);
  });

  afterEach(async () => {
    await mockContext.db.delete(blocks);
    await mockContext.db.delete(friends);
    await mockContext.db.delete(friendRequests);
  });

  test("blocks user", async () => {
    expect.hasAssertions();

    const user = await createMockUser(mockContext.db);
    const blockedUser = await blockCaller.createBlock(user.id);

    expect(blockedUser.id).toBe(user.id);
  });

  test("blocks user and removes friendship", async () => {
    expect.hasAssertions();

    const { user } = await createFriendship(mockContext);
    await blockCaller.createBlock(user.id);
    const friendUsers = await friendCaller.readFriends();

    expect(friendUsers).toHaveLength(0);
  });

  test("fails to block self", async () => {
    expect.hasAssertions();

    const userId = getMockSession().user.id;

    await expect(blockCaller.createBlock(userId)).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new InvalidOperationError(Operation.Create, DatabaseEntityType.Block, userId).message}]`,
    );
  });

  test("fails to block non-existent user", async () => {
    expect.hasAssertions();

    const userId = crypto.randomUUID();

    await expect(blockCaller.createBlock(userId)).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new NotFoundError(DatabaseEntityType.User, userId).message}]`,
    );
  });

  test("blocks user twice (idempotent)", async () => {
    expect.hasAssertions();

    const user = await createMockUser(mockContext.db);
    await blockCaller.createBlock(user.id);
    const blockedUser = await blockCaller.createBlock(user.id);

    expect(blockedUser.id).toBe(user.id);
  });

  test("reads blocked users", async () => {
    expect.hasAssertions();

    const user = await createMockUser(mockContext.db);
    await blockCaller.createBlock(user.id);
    const blockedUsers = await blockCaller.readBlockedUsers();

    expect(blockedUsers).toHaveLength(1);
    expect(takeOne(blockedUsers).id).toBe(user.id);
  });

  test("unblocks user", async () => {
    expect.hasAssertions();

    const user = await createMockUser(mockContext.db);
    await blockCaller.createBlock(user.id);
    await blockCaller.deleteBlock(user.id);
    const blockedUsers = await blockCaller.readBlockedUsers();

    expect(blockedUsers).toHaveLength(0);
  });

  test("fails to unblock self", async () => {
    expect.hasAssertions();

    const userId = getMockSession().user.id;

    await expect(blockCaller.deleteBlock(userId)).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new InvalidOperationError(Operation.Delete, DatabaseEntityType.Block, userId).message}]`,
    );
  });

  test("fails to unblock non-existent block", async () => {
    expect.hasAssertions();

    const userId = crypto.randomUUID();

    await expect(blockCaller.deleteBlock(userId)).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new InvalidOperationError(Operation.Delete, DatabaseEntityType.Block, userId).message}]`,
    );
  });

  test("search excludes blocked users", async () => {
    expect.hasAssertions();

    const blockedUser = await createMockUser(mockContext.db);
    await blockCaller.createBlock(blockedUser.id);
    const searchedUsers = await friendCaller.searchUsers(blockedUser.name);

    expect(searchedUsers.every(({ id }) => id !== blockedUser.id)).toBe(true);
  });

  test("search excludes users who blocked you", async () => {
    expect.hasAssertions();

    const user = getMockSession().user;
    const { user: blockerUser } = await mockSessionOnce(mockContext.db);
    await blockCaller.createBlock(user.id);
    await mockSessionOnce(mockContext.db, user);

    const searchedUsers = await friendCaller.searchUsers(blockerUser.name);

    expect(searchedUsers.every(({ id }) => id !== blockerUser.id)).toBe(true);
  });
});
