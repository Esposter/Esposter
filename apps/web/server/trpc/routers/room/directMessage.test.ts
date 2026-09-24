import type { Context } from "@@/server/trpc/context";
import type { TRPCRouter } from "@@/server/trpc/routers";
import type { DecorateRouterRecord } from "@trpc/server/unstable-core-do-not-import";

import { getDirectMessageParticipantKey } from "@@/server/services/room/directMessage/getDirectMessageParticipantKey";
import { createCallerFactory } from "@@/server/trpc";
import { createMockContext, createMockUser, getMockSession, mockSessionOnce } from "@@/server/trpc/context.test";
import { createFriends } from "@@/server/trpc/routers/createFriends.test";
import { roomRouter } from "@@/server/trpc/routers/room";
import { createDirectMessageWithFriend } from "@@/server/trpc/routers/room/createDirectMessageWithFriend.test";
import { directMessageRouter } from "@@/server/trpc/routers/room/directMessage";
import { DatabaseEntityType, DerivedDatabaseEntityType, friends, roomsInMessage, RoomType } from "@esposter/db-schema";
import { InvalidOperationError, Operation, takeOne } from "@esposter/shared";
import { afterEach, beforeAll, describe, expect, test } from "vitest";

describe("directMessageRouter", () => {
  let mockContext: Context;
  let directMessageCaller: DecorateRouterRecord<TRPCRouter["room"]["directMessage"]>;
  let roomCaller: DecorateRouterRecord<TRPCRouter["room"]>;
  const name = "name";

  beforeAll(async () => {
    mockContext = await createMockContext();
    directMessageCaller = createCallerFactory(directMessageRouter)(mockContext);
    roomCaller = createCallerFactory(roomRouter)(mockContext);
  });

  afterEach(async () => {
    await mockContext.db.delete(friends);
    await mockContext.db.delete(roomsInMessage);
  });

  test("creates direct message", async () => {
    expect.hasAssertions();

    const { directMessage, mainUser, user } = await createDirectMessageWithFriend(mockContext);

    expect(directMessage.type).toBe(RoomType.DirectMessage);
    expect(directMessage.participantKey).toBe(getDirectMessageParticipantKey([mainUser.id, user.id]));
  });

  test("creates direct message to be idempotent", async () => {
    expect.hasAssertions();

    const { directMessage: directMessage1, user } = await createDirectMessageWithFriend(mockContext);
    const directMessage2 = await directMessageCaller.createDirectMessage([user.id]);

    expect(directMessage1.id).toBe(directMessage2.id);
  });

  test("creates direct message to be idempotent regardless of order", async () => {
    expect.hasAssertions();

    const initialUser = getMockSession().user;
    const userB = await createMockUser(mockContext.db);
    await createFriends(mockContext, initialUser, userB);
    await mockSessionOnce(mockContext.db, userB);
    const directMessage1 = await directMessageCaller.createDirectMessage([initialUser.id]);
    const directMessage2 = await directMessageCaller.createDirectMessage([userB.id]);

    expect(directMessage1.id).toBe(directMessage2.id);
  });

  test("reads direct messages", async () => {
    expect.hasAssertions();

    const { directMessage } = await createDirectMessageWithFriend(mockContext);
    const directMessages = await directMessageCaller.readDirectMessages();

    expect(directMessages.items).toHaveLength(1);
    expect(takeOne(directMessages.items).id).toBe(directMessage.id);
  });

  test("reads direct messages excluding hidden", async () => {
    expect.hasAssertions();

    const { directMessage } = await createDirectMessageWithFriend(mockContext);
    await directMessageCaller.hideDirectMessage(directMessage.id);
    const directMessages = await directMessageCaller.readDirectMessages();

    expect(directMessages.items).toHaveLength(0);
  });

  test("hides direct message", async () => {
    expect.hasAssertions();

    const { directMessage } = await createDirectMessageWithFriend(mockContext);

    await expect(directMessageCaller.hideDirectMessage(directMessage.id)).resolves.toBeUndefined();
  });

  test("fails hide with non-member", async () => {
    expect.hasAssertions();

    const { directMessage } = await createDirectMessageWithFriend(mockContext);
    await mockSessionOnce(mockContext.db);

    await expect(directMessageCaller.hideDirectMessage(directMessage.id)).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: UNAUTHORIZED]`,
    );
  });

  test("unhides direct message on re-open", async () => {
    expect.hasAssertions();

    const { directMessage, user } = await createDirectMessageWithFriend(mockContext);
    await directMessageCaller.hideDirectMessage(directMessage.id);
    await directMessageCaller.createDirectMessage([user.id]);
    const directMessages = await directMessageCaller.readDirectMessages();

    expect(directMessages.items).toHaveLength(1);
    expect(takeOne(directMessages.items).id).toBe(directMessage.id);
  });

  test("reads direct message participants", async () => {
    expect.hasAssertions();

    const { directMessage, user } = await createDirectMessageWithFriend(mockContext);
    const participantsData = await directMessageCaller.readDirectMessageParticipants([directMessage.id]);

    expect(participantsData).toHaveLength(1);

    const entry = takeOne(participantsData);

    expect(entry.roomId).toBe(directMessage.id);
    expect(entry.participants).toHaveLength(1);
    expect(takeOne(entry.participants).id).toBe(user.id);
  });

  test("creates direct message participant", async () => {
    expect.hasAssertions();

    const { directMessage, mainUser, user } = await createDirectMessageWithFriend(mockContext);
    const addedUser = await createMockUser(mockContext.db);
    await createFriends(mockContext, mainUser, addedUser);
    await directMessageCaller.createDirectMessageParticipants({ roomId: directMessage.id, userIds: [addedUser.id] });
    const participantsData = await directMessageCaller.readDirectMessageParticipants([directMessage.id]);
    const directMessages = await directMessageCaller.readDirectMessages();

    expect(
      takeOne(participantsData)
        .participants.map(({ id }) => id)
        .toSorted(),
    ).toStrictEqual([addedUser.id, user.id].toSorted());
    expect(takeOne(directMessages.items).participantKey).toBe(
      getDirectMessageParticipantKey([addedUser.id, mainUser.id, user.id]),
    );
  });

  test("deletes direct message participant", async () => {
    expect.hasAssertions();

    const { directMessage, mainUser, user } = await createDirectMessageWithFriend(mockContext);
    const addedUser = await createMockUser(mockContext.db);
    await createFriends(mockContext, mainUser, addedUser);
    await directMessageCaller.createDirectMessageParticipants({ roomId: directMessage.id, userIds: [addedUser.id] });
    await directMessageCaller.deleteDirectMessageParticipant({ roomId: directMessage.id, userId: addedUser.id });
    const participantsData = await directMessageCaller.readDirectMessageParticipants([directMessage.id]);
    const directMessages = await directMessageCaller.readDirectMessages();

    expect(takeOne(participantsData).participants.map(({ id }) => id)).toStrictEqual([user.id]);
    expect(takeOne(directMessages.items).participantKey).toBe(getDirectMessageParticipantKey([mainUser.id, user.id]));
  });

  test("deletes self as direct message participant", async () => {
    expect.hasAssertions();

    const { directMessage, mainUser } = await createDirectMessageWithFriend(mockContext);
    await directMessageCaller.deleteDirectMessageParticipant({ roomId: directMessage.id, userId: mainUser.id });
    const directMessages = await directMessageCaller.readDirectMessages();

    expect(directMessages.items).toHaveLength(0);
  });

  test("fails create direct message participant with non-friend", async () => {
    expect.hasAssertions();

    const { directMessage } = await createDirectMessageWithFriend(mockContext);
    const addedUser = await createMockUser(mockContext.db);

    await expect(
      directMessageCaller.createDirectMessageParticipants({ roomId: directMessage.id, userIds: [addedUser.id] }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new InvalidOperationError(Operation.Create, DerivedDatabaseEntityType.DirectMessage, addedUser.id).message}]`,
    );
  });

  test("excludes a room the caller is not a member of from read participants", async () => {
    expect.hasAssertions();

    const { directMessage } = await createDirectMessageWithFriend(mockContext);
    await mockSessionOnce(mockContext.db);

    const participantsData = await directMessageCaller.readDirectMessageParticipants([directMessage.id]);

    expect(participantsData).toHaveLength(0);
  });

  test("fails create direct message with non-friend", async () => {
    expect.hasAssertions();

    const userId = getMockSession().user.id;
    const user = await createMockUser(mockContext.db);

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
      `[TRPCError: ${new InvalidOperationError(Operation.Read, DatabaseEntityType.Room, newRoom.id).message}]`,
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
