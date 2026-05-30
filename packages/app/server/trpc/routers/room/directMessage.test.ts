import type { Context } from "@@/server/trpc/context";
import type { TRPCRouter } from "@@/server/trpc/routers";
import type { DecorateRouterRecord } from "@trpc/server/unstable-core-do-not-import";
import type { User } from "better-auth";

import { createCallerFactory } from "@@/server/trpc";
import { createMockContext, getMockSession, mockSessionOnce } from "@@/server/trpc/context.test";
import { friendRequestRouter } from "@@/server/trpc/routers/friendRequest";
import { roomRouter } from "@@/server/trpc/routers/room";
import { directMessageRouter } from "@@/server/trpc/routers/room/directMessage";
import { DatabaseEntityType, DerivedDatabaseEntityType, friends, roomsInMessage } from "@esposter/db-schema";
import { InvalidOperationError, Operation, takeOne } from "@esposter/shared";
import { afterEach, beforeAll, describe, expect, test } from "vitest";

describe("directMessage", () => {
  let mockContext: Context;
  let directMessageCaller: DecorateRouterRecord<TRPCRouter["room"]["directMessage"]>;
  let friendRequestCaller: DecorateRouterRecord<TRPCRouter["friendRequest"]>;
  let roomCaller: DecorateRouterRecord<TRPCRouter["room"]>;
  const name = "name";

  beforeAll(async () => {
    mockContext = await createMockContext();
    directMessageCaller = createCallerFactory(directMessageRouter)(mockContext);
    friendRequestCaller = createCallerFactory(friendRequestRouter)(mockContext);
    roomCaller = createCallerFactory(roomRouter)(mockContext);
  });

  afterEach(async () => {
    await mockContext.db.delete(friends);
    await mockContext.db.delete(roomsInMessage);
  });

  const createFriends = async (userA: User, userB: User) => {
    await mockSessionOnce(mockContext.db, userA);
    await friendRequestCaller.sendFriendRequest(userB.id);
    await mockSessionOnce(mockContext.db, userB);
    await friendRequestCaller.acceptFriendRequest(userA.id);
  };

  test("creates direct message", async () => {
    expect.hasAssertions();

    const mainUser = getMockSession().user;
    const { user } = await mockSessionOnce(mockContext.db);
    getMockSession();
    await createFriends(mainUser, user);
    const directMessage = await directMessageCaller.createDirectMessage([user.id]);

    expect(directMessage.type).toBe("DirectMessage");
    expect(directMessage.participantKey).toContain(user.id);
    expect(directMessage.participantKey).toContain(mainUser.id);
  });

  test("creates direct message to be idempotent", async () => {
    expect.hasAssertions();

    const mainUser = getMockSession().user;
    const { user } = await mockSessionOnce(mockContext.db);
    getMockSession();
    await createFriends(mainUser, user);
    const directMessage1 = await directMessageCaller.createDirectMessage([user.id]);
    const directMessage2 = await directMessageCaller.createDirectMessage([user.id]);

    expect(directMessage1.id).toBe(directMessage2.id);
  });

  test("creates direct message to be idempotent regardless of order", async () => {
    expect.hasAssertions();

    const initialUser = getMockSession().user;
    const { user: userB } = await mockSessionOnce(mockContext.db);
    getMockSession();
    await createFriends(initialUser, userB);
    await mockSessionOnce(mockContext.db, userB);
    const directMessage1 = await directMessageCaller.createDirectMessage([initialUser.id]);
    const directMessage2 = await directMessageCaller.createDirectMessage([userB.id]);

    expect(directMessage1.id).toBe(directMessage2.id);
  });

  test("reads direct messages", async () => {
    expect.hasAssertions();

    const mainUser = getMockSession().user;
    const { user } = await mockSessionOnce(mockContext.db);
    getMockSession();
    await createFriends(mainUser, user);
    const directMessage = await directMessageCaller.createDirectMessage([user.id]);
    const readDirectMessages = await directMessageCaller.readDirectMessages();

    expect(readDirectMessages.items).toHaveLength(1);
    expect(takeOne(readDirectMessages.items).id).toBe(directMessage.id);
  });

  test("reads direct messages excluding hidden", async () => {
    expect.hasAssertions();

    const mainUser = getMockSession().user;
    const { user } = await mockSessionOnce(mockContext.db);
    getMockSession();
    await createFriends(mainUser, user);
    const directMessage = await directMessageCaller.createDirectMessage([user.id]);
    await directMessageCaller.hideDirectMessage(directMessage.id);
    const readDirectMessages = await directMessageCaller.readDirectMessages();

    expect(readDirectMessages.items).toHaveLength(0);
  });

  test("hides direct message", async () => {
    expect.hasAssertions();

    const mainUser = getMockSession().user;
    const { user } = await mockSessionOnce(mockContext.db);
    getMockSession();
    await createFriends(mainUser, user);
    const directMessage = await directMessageCaller.createDirectMessage([user.id]);

    await expect(directMessageCaller.hideDirectMessage(directMessage.id)).resolves.toBeUndefined();
  });

  test("fails hide with non-member", async () => {
    expect.hasAssertions();

    const mainUser = getMockSession().user;
    const { user } = await mockSessionOnce(mockContext.db);
    getMockSession();
    await createFriends(mainUser, user);
    const directMessage = await directMessageCaller.createDirectMessage([user.id]);
    await mockSessionOnce(mockContext.db);

    await expect(directMessageCaller.hideDirectMessage(directMessage.id)).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: UNAUTHORIZED]`,
    );
  });

  test("unhides direct message on re-open", async () => {
    expect.hasAssertions();

    const mainUser = getMockSession().user;
    const { user } = await mockSessionOnce(mockContext.db);
    getMockSession();
    await createFriends(mainUser, user);
    const directMessage = await directMessageCaller.createDirectMessage([user.id]);
    await directMessageCaller.hideDirectMessage(directMessage.id);
    await directMessageCaller.createDirectMessage([user.id]);
    const readDirectMessages = await directMessageCaller.readDirectMessages();

    expect(readDirectMessages.items).toHaveLength(1);
    expect(takeOne(readDirectMessages.items).id).toBe(directMessage.id);
  });

  test("reads direct message participants", async () => {
    expect.hasAssertions();

    const mainUser = getMockSession().user;
    const { user } = await mockSessionOnce(mockContext.db);
    getMockSession();
    await createFriends(mainUser, user);
    const directMessage = await directMessageCaller.createDirectMessage([user.id]);
    const participantsData = await directMessageCaller.readDirectMessageParticipants([directMessage.id]);

    expect(participantsData).toHaveLength(1);

    const entry = takeOne(participantsData);

    expect(entry.roomId).toBe(directMessage.id);
    expect(entry.participants).toHaveLength(1);
    expect(takeOne(entry.participants).id).toBe(user.id);
  });

  test("creates direct message participant", async () => {
    expect.hasAssertions();

    const mainUser = getMockSession().user;
    const { user } = await mockSessionOnce(mockContext.db);
    getMockSession();
    await createFriends(mainUser, user);
    const directMessage = await directMessageCaller.createDirectMessage([user.id]);
    const { user: addedUser } = await mockSessionOnce(mockContext.db);
    getMockSession();
    await createFriends(mainUser, addedUser);
    await directMessageCaller.createDirectMessageParticipants({ roomId: directMessage.id, userIds: [addedUser.id] });
    const participantsData = await directMessageCaller.readDirectMessageParticipants([directMessage.id]);
    const readDirectMessages = await directMessageCaller.readDirectMessages();

    expect(
      takeOne(participantsData)
        .participants.map(({ id }) => id)
        .toSorted(),
    ).toStrictEqual([addedUser.id, user.id].toSorted());
    expect(takeOne(readDirectMessages.items).participantKey).toContain(addedUser.id);
  });

  test("deletes direct message participant", async () => {
    expect.hasAssertions();

    const mainUser = getMockSession().user;
    const { user } = await mockSessionOnce(mockContext.db);
    getMockSession();
    await createFriends(mainUser, user);
    const directMessage = await directMessageCaller.createDirectMessage([user.id]);
    const { user: addedUser } = await mockSessionOnce(mockContext.db);
    getMockSession();
    await createFriends(mainUser, addedUser);
    await directMessageCaller.createDirectMessageParticipants({ roomId: directMessage.id, userIds: [addedUser.id] });
    await directMessageCaller.deleteDirectMessageParticipant({ roomId: directMessage.id, userId: addedUser.id });
    const participantsData = await directMessageCaller.readDirectMessageParticipants([directMessage.id]);
    const readDirectMessages = await directMessageCaller.readDirectMessages();

    expect(takeOne(participantsData).participants.map(({ id }) => id)).toStrictEqual([user.id]);
    expect(takeOne(readDirectMessages.items).participantKey).not.toContain(addedUser.id);
  });

  test("deletes self as direct message participant", async () => {
    expect.hasAssertions();

    const mainUser = getMockSession().user;
    const { user } = await mockSessionOnce(mockContext.db);
    getMockSession();
    await createFriends(mainUser, user);
    const directMessage = await directMessageCaller.createDirectMessage([user.id]);
    await directMessageCaller.deleteDirectMessageParticipant({ roomId: directMessage.id, userId: mainUser.id });
    const readDirectMessages = await directMessageCaller.readDirectMessages();

    expect(readDirectMessages.items).toHaveLength(0);
  });

  test("fails create direct message participant with non-friend", async () => {
    expect.hasAssertions();

    const mainUser = getMockSession().user;
    const { user } = await mockSessionOnce(mockContext.db);
    getMockSession();
    await createFriends(mainUser, user);
    const directMessage = await directMessageCaller.createDirectMessage([user.id]);
    const { user: addedUser } = await mockSessionOnce(mockContext.db);
    getMockSession();

    await expect(
      directMessageCaller.createDirectMessageParticipants({ roomId: directMessage.id, userIds: [addedUser.id] }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new InvalidOperationError(Operation.Create, DerivedDatabaseEntityType.DirectMessage, addedUser.id).message}]`,
    );
  });

  test("fails read direct message participants with non-member room", async () => {
    expect.hasAssertions();

    const mainUser = getMockSession().user;
    const { user } = await mockSessionOnce(mockContext.db);
    getMockSession();
    await createFriends(mainUser, user);
    const directMessage = await directMessageCaller.createDirectMessage([user.id]);
    await mockSessionOnce(mockContext.db);

    const participantsData = await directMessageCaller.readDirectMessageParticipants([directMessage.id]);

    expect(participantsData).toHaveLength(0);
  });

  test("fails create direct message with non-friend", async () => {
    expect.hasAssertions();

    const userId = getMockSession().user.id;
    const { user } = await mockSessionOnce(mockContext.db);
    getMockSession();

    await expect(directMessageCaller.createDirectMessage([user.id])).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new InvalidOperationError(Operation.Create, DerivedDatabaseEntityType.DirectMessage, userId).message}]`,
    );
  });

  test("fails create direct message with self-only", async () => {
    expect.hasAssertions();

    const userId = getMockSession().user.id;

    await expect(directMessageCaller.createDirectMessage([userId])).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new InvalidOperationError(Operation.Create, DerivedDatabaseEntityType.DirectMessage, userId).message}]`,
    );
  });

  test("fails hide with regular room", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });

    await expect(directMessageCaller.hideDirectMessage(newRoom.id)).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new InvalidOperationError(Operation.Read, DatabaseEntityType.UserToRoom, newRoom.id).message}]`,
    );
  });

  test("fails hide non-member non-DM room with UNAUTHORIZED before room type check", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    await mockSessionOnce(mockContext.db);

    await expect(directMessageCaller.hideDirectMessage(newRoom.id)).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: UNAUTHORIZED]`,
    );
  });

  test("filters regular rooms from read participants", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const participantsData = await directMessageCaller.readDirectMessageParticipants([newRoom.id]);

    expect(participantsData).toHaveLength(0);
  });
});
