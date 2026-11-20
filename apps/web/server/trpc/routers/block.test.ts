import type { Context } from "#server/trpc/context";
import type { TRPCRouter } from "#server/trpc/routers/index";
import type { DecorateRouterRecord } from "@trpc/server/unstable-core-do-not-import";

import {
  createMockAuthSession,
  createMockCaller,
  createMockContext,
  createMockUser,
  getMockSession,
} from "#server/trpc/context.test";
import { createCallerFactory } from "#server/trpc/index";
import { blockRouter } from "#server/trpc/routers/block";
import { createFriendship } from "#server/trpc/routers/createFriendship.test";
import { friendRouter } from "#server/trpc/routers/friend";
import { postRouter } from "#server/trpc/routers/post";
import { blocksInSocial, DatabaseEntityType, friendRequestsInSocial, friendsInSocial } from "@esposter/db-schema";
import { getFriendshipId, InvalidOperationError, NotFoundError, Operation, takeOne } from "@esposter/shared";
import { v7 } from "uuid";
import { afterEach, assert, beforeAll, describe, expect, test } from "vitest";

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
    await mockContext.db.delete(blocksInSocial);
    await mockContext.db.delete(friendsInSocial);
    await mockContext.db.delete(friendRequestsInSocial);
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
    const friendships = await friendCaller.readFriends();

    expect(friendships).toHaveLength(1);
    expect(takeOne(friendships).id).toBe(getFriendshipId(getMockSession().user.id, user.id));
    expect(takeOne(friendships).deletedAt).not.toBeNull();
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

    const userId = v7();

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
    expect(takeOne(blockedUsers).blocked.id).toBe(user.id);
  });

  test("unblocks user", async () => {
    expect.hasAssertions();

    const user = await createMockUser(mockContext.db);
    await blockCaller.createBlock(user.id);
    await blockCaller.deleteBlock(user.id);
    const blockedUsers = await blockCaller.readBlockedUsers();

    expect(blockedUsers).toHaveLength(1);
    expect(takeOne(blockedUsers).blocked.id).toBe(user.id);
    expect(takeOne(blockedUsers).deletedAt).not.toBeNull();
  });

  // An unblock keeps the block as a tombstone, so blocking again revives that row at a version above the tombstone's
  test("blocks a user again after unblocking, reviving the block at a higher version", async () => {
    expect.hasAssertions();

    const user = await createMockUser(mockContext.db);
    const blockWhere = { blockedId: { eq: user.id }, blockerId: { eq: getMockSession().user.id } };
    await blockCaller.createBlock(user.id);
    await blockCaller.deleteBlock(user.id);
    const tombstone = await mockContext.db.query.blocksInSocial.findFirst({ where: blockWhere });
    await blockCaller.createBlock(user.id);
    const block = await mockContext.db.query.blocksInSocial.findFirst({ where: blockWhere });

    assert.exists(tombstone);
    assert.exists(block);
    expect(tombstone.deletedAt).not.toBeNull();
    expect(tombstone.version).toBe(1);
    expect(block.deletedAt).toBeNull();
    expect(block.version).toBe(tombstone.version + 1);
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

    const userId = v7();

    await expect(blockCaller.deleteBlock(userId)).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new InvalidOperationError(Operation.Delete, DatabaseEntityType.Block, userId).message}]`,
    );
  });

  test("search excludes blocked users", async () => {
    expect.hasAssertions();

    const blockedUser = await createMockUser(mockContext.db);
    await blockCaller.createBlock(blockedUser.id);
    const searchedUsers = await friendCaller.searchUsers(blockedUser.name);

    expect(searchedUsers).toStrictEqual([]);
  });

  test("search excludes users who blocked you", async () => {
    expect.hasAssertions();

    const user = getMockSession().user;
    const blockerAuthSession = await createMockAuthSession(mockContext.db);
    const blockerCaller = createCallerFactory(blockRouter)(await createMockContext(blockerAuthSession));
    await blockerCaller.createBlock(user.id);
    const userAuthSession = await createMockAuthSession(mockContext.db, user);
    const userCaller = createCallerFactory(friendRouter)(await createMockContext(userAuthSession));

    const searchedUsers = await userCaller.searchUsers(blockerAuthSession.user.name);

    expect(searchedUsers).toStrictEqual([]);
  });

  // The feed hides the blocked user's posts, so the feed a blocker reads changes when the block lands
  test("a block removes the blocked user's posts from the feed the blocker reads", async () => {
    expect.hasAssertions();

    const authorAuthSession = await createMockAuthSession(mockContext.db);
    await (await createMockCaller(postRouter, authorAuthSession)).createPost({ title: "title" });
    const feedCaller = createCallerFactory(postRouter)(mockContext);
    const feedBefore = await feedCaller.readPosts();
    expect(feedBefore.items.map(({ userId }) => userId)).toContain(authorAuthSession.user.id);

    await blockCaller.createBlock(authorAuthSession.user.id);

    const feedAfter = await feedCaller.readPosts();
    expect(feedAfter.items.map(({ userId }) => userId)).not.toContain(authorAuthSession.user.id);
  });

  // A removed block stops hiding its user from search and their posts from the feed the blocker reads
  test("search finds a user whose block was removed", async () => {
    expect.hasAssertions();

    const blockedUser = await createMockUser(mockContext.db);
    await blockCaller.createBlock(blockedUser.id);
    await blockCaller.deleteBlock(blockedUser.id);
    const searchedUsers = await friendCaller.searchUsers(blockedUser.name);

    expect(searchedUsers.map(({ id }) => id)).toStrictEqual([blockedUser.id]);
  });

  test("a removed block restores the blocked user's posts to the feed the blocker reads", async () => {
    expect.hasAssertions();

    const authorAuthSession = await createMockAuthSession(mockContext.db);
    await (await createMockCaller(postRouter, authorAuthSession)).createPost({ title: "title" });
    await blockCaller.createBlock(authorAuthSession.user.id);
    await blockCaller.deleteBlock(authorAuthSession.user.id);
    const feed = await createCallerFactory(postRouter)(mockContext).readPosts();

    expect(feed.items.map(({ userId }) => userId)).toContain(authorAuthSession.user.id);
  });
});
