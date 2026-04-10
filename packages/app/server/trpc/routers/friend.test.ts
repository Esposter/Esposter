import type { Context } from "@@/server/trpc/context";
import type { TRPCRouter } from "@@/server/trpc/routers";
import type { DecorateRouterRecord } from "@trpc/server/unstable-core-do-not-import";

import { createCallerFactory } from "@@/server/trpc";
import { createMockContext, getMockSession, mockSessionOnce } from "@@/server/trpc/context.test";
import { friendRequestRouter } from "@@/server/trpc/routers/friendRequest";
import { friendRouter } from "@@/server/trpc/routers/friend";
import { withAsyncIterator } from "@@/server/trpc/routers/testUtils.test";
import { blocks, DatabaseEntityType, friendRequests, friends } from "@esposter/db-schema";
import { InvalidOperationError, Operation, takeOne } from "@esposter/shared";
import { afterEach, assert, beforeAll, describe, expect, test } from "vitest";

describe("friend", () => {
  let mockContext: Context;
  let caller: DecorateRouterRecord<TRPCRouter["friend"]>;
  let friendRequestCaller: DecorateRouterRecord<TRPCRouter["friendRequest"]>;

  beforeAll(async () => {
    mockContext = await createMockContext();
    caller = createCallerFactory(friendRouter)(mockContext);
    friendRequestCaller = createCallerFactory(friendRequestRouter)(mockContext);
  });

  afterEach(async () => {
    await mockContext.db.delete(blocks);
    await mockContext.db.delete(friends);
    await mockContext.db.delete(friendRequests);
  });

  // Helper: establish an accepted friendship between default user and a new user
  const setupFriendship = async () => {
    const userId = getMockSession().user.id;
    const { user } = await mockSessionOnce(mockContext.db);
    await friendRequestCaller.sendFriendRequest(userId);
    await friendRequestCaller.acceptFriendRequest(user.id);
    return { userId, user };
  };

  test("reads friends as sender", async () => {
    expect.hasAssertions();

    const { user } = await setupFriendship();
    const friendList = await caller.readFriends();

    expect(friendList).toHaveLength(1);
    expect(takeOne(friendList).id).toBe(user.id);
  });

  test("reads friends as receiver", async () => {
    expect.hasAssertions();

    const { userId, user } = await setupFriendship();
    await mockSessionOnce(mockContext.db, user);
    const friendList = await caller.readFriends();

    expect(friendList).toHaveLength(1);
    expect(takeOne(friendList).id).toBe(userId);
  });

  test("deletes friend", async () => {
    expect.hasAssertions();

    const { user } = await setupFriendship();
    await caller.deleteFriend(user.id);

    const friendList = await caller.readFriends();

    expect(friendList).toHaveLength(0);
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

    const { user } = await setupFriendship();
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
    await caller.blockUser(userId);
    const receiverId = user.id;

    await expect(friendRequestCaller.sendFriendRequest(receiverId)).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new InvalidOperationError(Operation.Create, DatabaseEntityType.Friend, receiverId).message}]`,
    );
  });

  test("on delete friend notifies the other party", async () => {
    expect.hasAssertions();

    const senderPayload = getMockSession();
    const { user: receiverUser } = await mockSessionOnce(mockContext.db);
    await friendRequestCaller.sendFriendRequest(senderPayload.user.id);
    await friendRequestCaller.acceptFriendRequest(receiverUser.id);
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
