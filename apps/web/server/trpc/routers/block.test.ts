import type { Context } from "#server/trpc/context";
import type { TRPCRouter } from "#server/trpc/routers/index";
import type { DecorateRouterRecord } from "@trpc/server/unstable-core-do-not-import";

import { MockPublishedTopics } from "#server/services/realtime/publishTopics.test";
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
import { expectLiveTopicCoverage } from "#server/trpc/routers/liveTopicCoverage.test";
import { postRouter } from "#server/trpc/routers/post";
import { readTopicsHeader } from "#shared/services/realtime/readTopicsHeader";
import { blocksInSocial, DatabaseEntityType, friendRequestsInSocial, friendsInSocial } from "@esposter/db-schema";
import { InvalidOperationError, NotFoundError, Operation, takeOne } from "@esposter/shared";
import { v7 } from "uuid";
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
    const friendUsers = await friendCaller.readFriends();

    expect(friendUsers).toStrictEqual([]);
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
    expect(takeOne(blockedUsers).id).toBe(user.id);
  });

  test("unblocks user", async () => {
    expect.hasAssertions();

    const user = await createMockUser(mockContext.db);
    await blockCaller.createBlock(user.id);
    await blockCaller.deleteBlock(user.id);
    const blockedUsers = await blockCaller.readBlockedUsers();

    expect(blockedUsers).toStrictEqual([]);
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

  // The feed hides the blocked user's posts, so the feed a blocker reads is woken by the block that hides them
  test("a block wakes the feed the blocker reads", async () => {
    expect.hasAssertions();

    const authorAuthSession = await createMockAuthSession(mockContext.db);
    await (await createMockCaller(postRouter, authorAuthSession)).createPost({ title: "title" });
    const feedContext = { ...mockContext, responseHeaders: new Headers() };
    await createCallerFactory(postRouter)(feedContext).readPosts();

    MockPublishedTopics.length = 0;
    await blockCaller.createBlock(authorAuthSession.user.id);

    const published = new Set(MockPublishedTopics);
    const feedTopics = readTopicsHeader(feedContext.responseHeaders, "readPosts").flatMap(({ topics }) => topics);
    expect(feedTopics.some((topic) => published.has(topic))).toBe(true);
  });

  test("every query reads the tables it touches, and each block change wakes the list it changes", async () => {
    expect.hasAssertions();

    const user = await createMockUser(mockContext.db);

    await expectLiveTopicCoverage(
      blockRouter,
      {
        queries: [
          { call: (context) => createCallerFactory(blockRouter)(context).readBlockedUsers(), path: "readBlockedUsers" },
        ],
        writes: [
          { call: (context) => createCallerFactory(blockRouter)(context).createBlock(user.id), path: "createBlock" },
          { call: (context) => createCallerFactory(blockRouter)(context).deleteBlock(user.id), path: "deleteBlock" },
        ],
      },
      mockContext,
    );
  });
});
