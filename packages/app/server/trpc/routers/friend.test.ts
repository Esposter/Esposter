import type { Context } from "@@/server/trpc/context";
import type { TRPCRouter } from "@@/server/trpc/routers";
import type { DecorateRouterRecord } from "@trpc/server/unstable-core-do-not-import";

import { getFriendshipId } from "@@/server/services/friend/getFriendshipId";
import { createCallerFactory } from "@@/server/trpc";
import { createMockContext, getMockSession, mockSessionOnce } from "@@/server/trpc/context.test";
import { friendRouter } from "@@/server/trpc/routers/friend";
import { friendRequestRouter } from "@@/server/trpc/routers/friendRequest";
import { withAsyncIterator } from "@@/server/trpc/routers/testUtils.test";
import { blocks, DatabaseEntityType, friendRequests, friends } from "@esposter/db-schema";
import { InvalidOperationError, Operation, takeOne } from "@esposter/shared";
import { afterEach, assert, beforeAll, describe, expect, test } from "vitest";

describe("friend", () => {
  let mockContext: Context;
  let friendCaller: DecorateRouterRecord<TRPCRouter["friend"]>;
  let friendRequestCaller: DecorateRouterRecord<TRPCRouter["friendRequest"]>;

  beforeAll(async () => {
    mockContext = await createMockContext();
    friendCaller = createCallerFactory(friendRouter)(mockContext);
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
    return { user, userId };
  };

  test("reads friends as sender", async () => {
    expect.hasAssertions();

    const { user } = await setupFriendship();
    const friends = await friendCaller.readFriends();

    expect(friends).toHaveLength(1);
    expect(takeOne(friends).id).toBe(user.id);
  });

  test("reads friends as receiver", async () => {
    expect.hasAssertions();

    const { user, userId } = await setupFriendship();
    await mockSessionOnce(mockContext.db, user);
    const friends = await friendCaller.readFriends();

    expect(friends).toHaveLength(1);
    expect(takeOne(friends).id).toBe(userId);
  });

  test("deletes friend", async () => {
    expect.hasAssertions();

    const { user } = await setupFriendship();
    await friendCaller.deleteFriend(user.id);

    const friends = await friendCaller.readFriends();

    expect(friends).toHaveLength(0);
  });

  test("fails to delete self as friend", async () => {
    expect.hasAssertions();

    const userId = getMockSession().user.id;

    await expect(friendCaller.deleteFriend(userId)).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new InvalidOperationError(Operation.Delete, DatabaseEntityType.Friend, userId).message}]`,
    );
  });

  test("fails to delete non-existent friend", async () => {
    expect.hasAssertions();

    const userId = crypto.randomUUID();
    const friendshipId = getFriendshipId(getMockSession().user.id, userId);

    await expect(friendCaller.deleteFriend(userId)).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new InvalidOperationError(Operation.Delete, DatabaseEntityType.Friend, friendshipId).message}]`,
    );
  });

  test("searches users by name", async () => {
    expect.hasAssertions();

    const user = getMockSession().user;
    // Session=newUser: search for default user by name
    await mockSessionOnce(mockContext.db);
    const results = await friendCaller.searchUsers(user.name);

    expect(results).toHaveLength(1);
    expect(takeOne(results).id).toBe(user.id);
  });

  test("excludes self from search results", async () => {
    expect.hasAssertions();

    const user = getMockSession().user;
    const results = await friendCaller.searchUsers(user.name);

    expect(results.every(({ id }) => id !== user.id)).toBe(true);
  });

  test("on delete friend notifies the other party", async () => {
    expect.hasAssertions();

    const senderPayload = getMockSession();
    const { user: receiverUser } = await mockSessionOnce(mockContext.db);
    await friendRequestCaller.sendFriendRequest(senderPayload.user.id);
    await friendRequestCaller.acceptFriendRequest(receiverUser.id);
    const onDeleteFriend = await friendCaller.onDeleteFriend();
    await mockSessionOnce(mockContext.db, receiverUser);
    const data = await withAsyncIterator(
      () => onDeleteFriend,
      async (iterator) => {
        const [result] = await Promise.all([iterator.next(), friendCaller.deleteFriend(senderPayload.user.id)]);
        return result;
      },
    );

    assert(!data.done);

    expect(data.value).toBe(receiverUser.id);
  });
});
