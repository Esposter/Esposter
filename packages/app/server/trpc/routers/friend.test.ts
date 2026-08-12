import type { Context } from "@@/server/trpc/context";
import type { TRPCRouter } from "@@/server/trpc/routers";
import type { DecorateRouterRecord } from "@trpc/server/unstable-core-do-not-import";

import { getFriendshipId } from "@@/server/services/friend/getFriendshipId";
import { createCallerFactory } from "@@/server/trpc";
import { createMockContext, getMockSession, mockSessionOnce, replayMockSession } from "@@/server/trpc/context.test";
import { createFriendship } from "@@/server/trpc/routers/createFriendship.test";
import { friendRouter } from "@@/server/trpc/routers/friend";
import { getFirstEmit } from "@@/server/trpc/routers/getFirstEmit.test";
import { blocks, DatabaseEntityType, friendRequests, friends } from "@esposter/db-schema";
import { InvalidOperationError, Operation, takeOne } from "@esposter/shared";
import { afterEach, beforeAll, describe, expect, test } from "vitest";

describe("friend", () => {
  let mockContext: Context;
  let friendCaller: DecorateRouterRecord<TRPCRouter["friend"]>;

  beforeAll(async () => {
    mockContext = await createMockContext();
    friendCaller = createCallerFactory(friendRouter)(mockContext);
  });

  afterEach(async () => {
    await mockContext.db.delete(blocks);
    await mockContext.db.delete(friends);
    await mockContext.db.delete(friendRequests);
  });

  test("reads friends as sender", async () => {
    expect.hasAssertions();

    const { user } = await createFriendship(mockContext);
    const fetchedFriends = await friendCaller.readFriends();

    expect(fetchedFriends).toHaveLength(1);
    expect(takeOne(fetchedFriends).id).toBe(user.id);
  });

  test("reads friends as receiver", async () => {
    expect.hasAssertions();

    const { user, userId } = await createFriendship(mockContext);
    await mockSessionOnce(mockContext.db, user);
    const fetchedFriends = await friendCaller.readFriends();

    expect(fetchedFriends).toHaveLength(1);
    expect(takeOne(fetchedFriends).id).toBe(userId);
  });

  test("deletes friend", async () => {
    expect.hasAssertions();

    const { user } = await createFriendship(mockContext);
    await friendCaller.deleteFriend(user.id);

    const fetchedFriends = await friendCaller.readFriends();

    expect(fetchedFriends).toHaveLength(0);
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
    const users = await friendCaller.searchUsers(user.name);

    expect(users).toHaveLength(1);
    expect(takeOne(users).id).toBe(user.id);
  });

  test("excludes self from search results", async () => {
    expect.hasAssertions();

    const user = getMockSession().user;
    const users = await friendCaller.searchUsers(user.name);

    expect(users.every(({ id }) => id !== user.id)).toBe(true);
  });

  test("on delete friend notifies the other party", async () => {
    expect.hasAssertions();

    const { user: receiverUser, userId } = await createFriendship(mockContext);
    const onDeleteFriend = await friendCaller.onDeleteFriend();
    await mockSessionOnce(mockContext.db, receiverUser);
    const data = await getFirstEmit(
      () => onDeleteFriend,
      () => friendCaller.deleteFriend(userId),
    );

    expect(data).toBe(receiverUser.id);
  });

  test("on delete friend notifies caller", async () => {
    expect.hasAssertions();

    const { user: receiverUser, userId } = await createFriendship(mockContext);
    const receiverPayload = await mockSessionOnce(mockContext.db, receiverUser);
    const onDeleteFriend = await friendCaller.onDeleteFriend();
    replayMockSession(receiverPayload);
    const data = await getFirstEmit(
      () => onDeleteFriend,
      () => friendCaller.deleteFriend(userId),
    );

    expect(data).toBe(userId);
  });
});
