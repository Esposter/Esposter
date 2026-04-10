import type { Context } from "@@/server/trpc/context";
import type { TRPCRouter } from "@@/server/trpc/routers";
import type { DecorateRouterRecord } from "@trpc/server/unstable-core-do-not-import";

import { createCallerFactory } from "@@/server/trpc";
import { createMockContext, getMockSession, mockSessionOnce } from "@@/server/trpc/context.test";
import { friendRequestRouter } from "@@/server/trpc/routers/friendRequest";
import { withAsyncIterator } from "@@/server/trpc/routers/testUtils.test";
import { blocks, DatabaseEntityType, friendRequests, friends } from "@esposter/db-schema";
import { ID_SEPARATOR, InvalidOperationError, Operation, takeOne } from "@esposter/shared";
import { afterEach, assert, beforeAll, describe, expect, test } from "vitest";

describe("friendRequest", () => {
  let mockContext: Context;
  let caller: DecorateRouterRecord<TRPCRouter["friendRequest"]>;

  beforeAll(async () => {
    mockContext = await createMockContext();
    caller = createCallerFactory(friendRequestRouter)(mockContext);
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
    // Session=user: sends request to default user, returns the receiver
    const receiver = await caller.sendFriendRequest(userId);

    expect(receiver.id).toBe(userId);
  });

  test("sends friend request is idempotent", async () => {
    expect.hasAssertions();

    const userId = getMockSession().user.id;
    const { user } = await mockSessionOnce(mockContext.db);
    const friend1 = await caller.sendFriendRequest(userId);
    await mockSessionOnce(mockContext.db, user);
    const friend2 = await caller.sendFriendRequest(userId);

    expect(friend1.id).toBe(friend2.id);
  });

  test("fails send friend request to self", async () => {
    expect.hasAssertions();

    const userId = getMockSession().user.id;

    await expect(caller.sendFriendRequest(userId)).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new InvalidOperationError(Operation.Create, DatabaseEntityType.Friend, userId).message}]`,
    );
  });

  test("accepts friend request", async () => {
    expect.hasAssertions();

    const userId = getMockSession().user.id;
    const { user } = await mockSessionOnce(mockContext.db);
    // Session=user: sends request to default user
    await caller.sendFriendRequest(userId);
    // Session=default: accepts request from user
    const accepted = await caller.acceptFriendRequest(user.id);

    expect(accepted.senderId).toBe(user.id);
    expect(accepted.receiverId).toBe(userId);
  });

  test("fails accept non-existent friend request", async () => {
    expect.hasAssertions();

    const userId = getMockSession().user.id;
    const { user } = await mockSessionOnce(mockContext.db);
    const id = [userId, user.id].toSorted().join(ID_SEPARATOR);

    // Session=user: no request exists, try to accept from default user
    await expect(caller.acceptFriendRequest(userId)).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new InvalidOperationError(Operation.Update, DatabaseEntityType.Friend, id).message}]`,
    );
  });

  test("declines friend request", async () => {
    expect.hasAssertions();

    const userId = getMockSession().user.id;
    const { user } = await mockSessionOnce(mockContext.db);
    // Session=user: sends request to default user
    await caller.sendFriendRequest(userId);
    // Session=default: declines
    await caller.declineFriendRequest(user.id);

    const pendingRequests = await caller.readPendingRequests();

    expect(pendingRequests).toHaveLength(0);
  });

  test("reads pending requests", async () => {
    expect.hasAssertions();

    const userId = getMockSession().user.id;
    const { user } = await mockSessionOnce(mockContext.db);
    // Session=user: sends request to default user
    await caller.sendFriendRequest(userId);
    // Session=default: reads pending
    const pendingRequests = await caller.readPendingRequests();

    expect(pendingRequests).toHaveLength(1);
    expect(takeOne(pendingRequests).id).toBe(user.id);
  });

  test("reads sent requests", async () => {
    expect.hasAssertions();

    const userId = getMockSession().user.id;
    const { user } = await mockSessionOnce(mockContext.db);
    // Session=user: sends request to default user
    await caller.sendFriendRequest(userId);
    // Session=user again: reads sent requests
    await mockSessionOnce(mockContext.db, user);
    const sentRequests = await caller.readSentRequests();

    expect(sentRequests).toHaveLength(1);
    expect(takeOne(sentRequests).id).toBe(userId);
  });

  test("on send friend request notifies receiver", async () => {
    expect.hasAssertions();

    const receiverUser = getMockSession().user;
    const onSendFriendRequest = await caller.onSendFriendRequest();
    const { user: senderUser } = await mockSessionOnce(mockContext.db);
    const data = await withAsyncIterator(
      () => onSendFriendRequest,
      async (iterator) => {
        const [result] = await Promise.all([iterator.next(), caller.sendFriendRequest(receiverUser.id)]);
        return result;
      },
    );

    assert(!data.done);

    expect(data.value.id).toBe(senderUser.id);
  });

  test("on accept friend request notifies sender", async () => {
    expect.hasAssertions();

    const receiverUser = getMockSession().user;
    const { user: senderUser } = await mockSessionOnce(mockContext.db);
    // Sender sends request to receiver
    await caller.sendFriendRequest(receiverUser.id);
    // Sender subscribes to be notified when receiver accepts
    await mockSessionOnce(mockContext.db, senderUser);
    const onAcceptFriendRequest = await caller.onAcceptFriendRequest();
    const data = await withAsyncIterator(
      () => onAcceptFriendRequest,
      async (iterator) => {
        const [result] = await Promise.all([iterator.next(), caller.acceptFriendRequest(senderUser.id)]);
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
    // Sender sends request to receiver
    await caller.sendFriendRequest(receiverUser.id);
    // Sender subscribes to be notified when receiver declines
    await mockSessionOnce(mockContext.db, senderUser);
    const onDeclineFriendRequest = await caller.onDeclineFriendRequest();
    const data = await withAsyncIterator(
      () => onDeclineFriendRequest,
      async (iterator) => {
        const [result] = await Promise.all([iterator.next(), caller.declineFriendRequest(senderUser.id)]);
        return result;
      },
    );

    assert(!data.done);

    expect(data.value).toBe(receiverUser.id);
  });
});
