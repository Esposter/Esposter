import type { AuthSession } from "#server/models/auth/AuthSession";
import type { Context } from "#server/trpc/context";
import type { TRPCRouter } from "#server/trpc/routers";
import type { DecorateRouterRecord } from "@trpc/server/unstable-core-do-not-import";

import { roomObjectCalls } from "#server/composables/realtime/useRoomObject.test";
import { userObjectCalls } from "#server/composables/realtime/useUserObject.test";
import { getDirectMessageParticipantKey } from "#server/services/room/directMessage/getDirectMessageParticipantKey";
import { createCallerFactory } from "#server/trpc";
import { createMockAuthSession, createMockContext, createMockUser, getMockSession } from "#server/trpc/context.test";
import { blockRouter } from "#server/trpc/routers/block";
import { createFriends } from "#server/trpc/routers/createFriends.test";
import { roomRouter } from "#server/trpc/routers/room";
import { createDirectMessageWithFriend } from "#server/trpc/routers/room/createDirectMessageWithFriend.test";
import { directMessageRouter } from "#server/trpc/routers/room/directMessage";
import {
  DatabaseEntityType,
  DerivedDatabaseEntityType,
  friendsInSocial,
  PublicUserColumns,
  roomsInMessage,
  RoomType,
  usersToRoomsInMessage,
} from "@esposter/db-schema";
import { InvalidOperationError, Operation, takeOne } from "@esposter/shared";
import { and, eq, inArray } from "drizzle-orm";
import { afterEach, beforeAll, beforeEach, describe, expect, test, vi } from "vitest";

// The participants an add reads before it writes. A test lands a concurrent change in that gap through this hook, taken
// Once, so a concurrent add it makes reads the participants unhooked
const { onParticipantIdsRead } = vi.hoisted(() => ({
  onParticipantIdsRead: { current: undefined as (() => Promise<void>) | undefined },
}));
vi.mock(import("#server/services/room/directMessage/readDirectMessageParticipantIds"), async (importOriginal) => {
  const { readDirectMessageParticipantIds } = await importOriginal();
  return {
    readDirectMessageParticipantIds: async (db: Context["db"], roomId: string) => {
      const participantIds = await readDirectMessageParticipantIds(db, roomId);
      const onRead = onParticipantIdsRead.current;
      onParticipantIdsRead.current = undefined;
      await onRead?.();
      return participantIds;
    },
  };
});

describe("directMessageRouter", () => {
  let mockContext: Context;
  let directMessageCaller: DecorateRouterRecord<TRPCRouter["room"]["directMessage"]>;
  let roomCaller: DecorateRouterRecord<TRPCRouter["room"]>;
  const name = "name";
  const epoch = new Date(0);
  const later = new Date(Temporal.Duration.from({ seconds: 1 }).total("milliseconds"));
  // A context acting as the given user on a session of their own, or as a new user when none is given
  const createUserContext = async (user?: AuthSession["user"]) =>
    createMockContext(await createMockAuthSession(mockContext.db, user));

  beforeAll(async () => {
    mockContext = await createMockContext();
    directMessageCaller = createCallerFactory(directMessageRouter)(mockContext);
    roomCaller = createCallerFactory(roomRouter)(mockContext);
  });

  beforeEach(() => {
    roomObjectCalls.length = 0;
    userObjectCalls.length = 0;
    onParticipantIdsRead.current = undefined;
  });

  afterEach(async () => {
    await mockContext.db.delete(friendsInSocial);
    await mockContext.db.delete(roomsInMessage);
  });

  test("creates direct message", async () => {
    expect.hasAssertions();

    const { directMessage, mainUser, user } = await createDirectMessageWithFriend(mockContext);

    expect(directMessage.type).toBe(RoomType.DirectMessage);
    expect(directMessage.participantKey).toBe(getDirectMessageParticipantKey([mainUser.id, user.id]));
  });

  test("announces a new direct message's join to each of its participants", async () => {
    expect.hasAssertions();

    const { directMessage, mainUser, user } = await createDirectMessageWithFriend(mockContext);
    const publicMainUser = await mockContext.db.query.usersInAuth.findFirst({
      columns: PublicUserColumns,
      where: { id: { eq: mainUser.id } },
    });
    const publicUser = await mockContext.db.query.usersInAuth.findFirst({
      columns: PublicUserColumns,
      where: { id: { eq: user.id } },
    });

    expect(userObjectCalls).toContainEqual({
      args: [{ data: { displayName: "", roomId: directMessage.id, user: publicMainUser }, type: "joinRoom" }],
      method: "broadcastEvent",
      userId: mainUser.id,
    });
    expect(userObjectCalls).toContainEqual({
      args: [{ data: { displayName: "", roomId: directMessage.id, user: publicUser }, type: "joinRoom" }],
      method: "broadcastEvent",
      userId: user.id,
    });
  });

  test("creates direct message to be idempotent", async () => {
    expect.hasAssertions();

    const { directMessage: directMessage1, user } = await createDirectMessageWithFriend(mockContext);
    roomObjectCalls.length = 0;
    userObjectCalls.length = 0;
    const directMessage2 = await directMessageCaller.createDirectMessage([user.id]);

    expect(directMessage1.id).toBe(directMessage2.id);
    // The room already holds both participants, so nothing joined and nothing is announced
    expect(roomObjectCalls).toStrictEqual([]);
    expect(userObjectCalls).toStrictEqual([]);
  });

  test("creates direct message to be idempotent regardless of order", async () => {
    expect.hasAssertions();

    const initialUser = getMockSession().user;
    const userB = await createMockUser(mockContext.db);
    await createFriends(mockContext, initialUser, userB);
    const userBDirectMessageCaller = createCallerFactory(directMessageRouter)(await createUserContext(userB));
    const directMessage1 = await userBDirectMessageCaller.createDirectMessage([initialUser.id]);
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

  test("reads direct messages to the end across a page boundary between rooms tied on their last message time", async () => {
    expect.hasAssertions();

    const { directMessage: firstDirectMessage, mainUser } = await createDirectMessageWithFriend(mockContext);
    const secondFriend = await createMockUser(mockContext.db);
    await createFriends(mockContext, mainUser, secondFriend);
    const secondDirectMessage = await directMessageCaller.createDirectMessage([secondFriend.id]);
    const thirdFriend = await createMockUser(mockContext.db);
    await createFriends(mockContext, mainUser, thirdFriend);
    const thirdDirectMessage = await directMessageCaller.createDirectMessage([thirdFriend.id]);
    // The two older rooms share a last message time, so the page boundary falls inside that tie
    await mockContext.db
      .update(roomsInMessage)
      .set({ lastMessageAt: epoch })
      .where(inArray(roomsInMessage.id, [firstDirectMessage.id, secondDirectMessage.id]));
    await mockContext.db
      .update(roomsInMessage)
      .set({ lastMessageAt: later })
      .where(eq(roomsInMessage.id, thirdDirectMessage.id));
    const listedIds: string[] = [];
    let cursor = "";
    do {
      // oxlint-disable-next-line no-await-in-loop -- Pagination: the next page's cursor is the last page's answer
      const page = await directMessageCaller.readDirectMessages({ cursor, limit: 1 });
      listedIds.push(...page.items.map(({ id }) => id));
      cursor = page.nextCursor;
    } while (cursor);

    // The newer room first, then the tied rooms with the larger id first
    expect(listedIds).toStrictEqual([
      thirdDirectMessage.id,
      ...[firstDirectMessage.id, secondDirectMessage.id].toSorted().toReversed(),
    ]);
  });

  test("fails hide with non-member", async () => {
    expect.hasAssertions();

    const { directMessage } = await createDirectMessageWithFriend(mockContext);
    const nonMemberDirectMessageCaller = createCallerFactory(directMessageRouter)(await createUserContext());

    await expect(
      nonMemberDirectMessageCaller.hideDirectMessage(directMessage.id),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`[TRPCError: UNAUTHORIZED]`);
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
    const displayName = "Ally";
    await mockContext.db
      .update(usersToRoomsInMessage)
      .set({ displayName })
      .where(and(eq(usersToRoomsInMessage.roomId, directMessage.id), eq(usersToRoomsInMessage.userId, user.id)));
    const participantsData = await directMessageCaller.readDirectMessageParticipants([directMessage.id]);

    expect(participantsData).toHaveLength(1);

    const entry = takeOne(participantsData);

    expect(entry.roomId).toBe(directMessage.id);
    expect(entry.participants).toHaveLength(1);
    expect(takeOne(entry.participants).displayName).toBe(displayName);
    expect(takeOne(entry.participants).id).toBe(user.id);
    expect(takeOne(entry.participants).name).toBe(user.name);
  });

  test("creates direct message participant", async () => {
    expect.hasAssertions();

    const { directMessage, mainUser, user } = await createDirectMessageWithFriend(mockContext);
    const addedUser = await createMockUser(mockContext.db);
    await createFriends(mockContext, mainUser, addedUser);
    roomObjectCalls.length = 0;
    userObjectCalls.length = 0;
    await directMessageCaller.createDirectMessageParticipants({ roomId: directMessage.id, userIds: [addedUser.id] });
    const publicAddedUser = await mockContext.db.query.usersInAuth.findFirst({
      columns: PublicUserColumns,
      where: { id: { eq: addedUser.id } },
    });
    expect(userObjectCalls).toContainEqual({
      args: [{ data: { displayName: "", roomId: directMessage.id, user: publicAddedUser }, type: "joinRoom" }],
      method: "broadcastEvent",
      userId: addedUser.id,
    });
    await mockContext.db
      .update(usersToRoomsInMessage)
      .set({ displayName: "Zed" })
      .where(and(eq(usersToRoomsInMessage.roomId, directMessage.id), eq(usersToRoomsInMessage.userId, user.id)));
    await mockContext.db
      .update(usersToRoomsInMessage)
      .set({ displayName: "Amy" })
      .where(and(eq(usersToRoomsInMessage.roomId, directMessage.id), eq(usersToRoomsInMessage.userId, addedUser.id)));
    const participantsData = await directMessageCaller.readDirectMessageParticipants([directMessage.id]);
    const directMessages = await directMessageCaller.readDirectMessages();

    expect(takeOne(participantsData).participants.map(({ displayName }) => displayName)).toStrictEqual(["Amy", "Zed"]);
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
    roomObjectCalls.length = 0;
    userObjectCalls.length = 0;
    await directMessageCaller.deleteDirectMessageParticipant({ roomId: directMessage.id, userId: addedUser.id });
    const participantsData = await directMessageCaller.readDirectMessageParticipants([directMessage.id]);
    const directMessages = await directMessageCaller.readDirectMessages();

    expect(roomObjectCalls).toContainEqual({ args: [addedUser.id], method: "removeMember", roomId: directMessage.id });
    expect(userObjectCalls).toContainEqual({
      args: [{ data: { roomId: directMessage.id, userId: addedUser.id }, type: "leaveRoom" }],
      method: "broadcastEvent",
      userId: addedUser.id,
    });
    expect(takeOne(participantsData).participants.map(({ id }) => id)).toStrictEqual([user.id]);
    expect(takeOne(directMessages.items).participantKey).toBe(getDirectMessageParticipantKey([mainUser.id, user.id]));
  });

  test("fails delete of another participant by a participant who does not own the direct message", async () => {
    expect.hasAssertions();

    const { directMessage, mainUser, user } = await createDirectMessageWithFriend(mockContext);
    const addedUser = await createMockUser(mockContext.db);
    await createFriends(mockContext, mainUser, addedUser);
    await directMessageCaller.createDirectMessageParticipants({ roomId: directMessage.id, userIds: [addedUser.id] });
    const userDirectMessageCaller = createCallerFactory(directMessageRouter)(await createUserContext(user));

    await expect(
      userDirectMessageCaller.deleteDirectMessageParticipant({ roomId: directMessage.id, userId: addedUser.id }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`[TRPCError: UNAUTHORIZED]`);
  });

  test("deletes self as direct message participant", async () => {
    expect.hasAssertions();

    const { directMessage, mainUser } = await createDirectMessageWithFriend(mockContext);
    await directMessageCaller.deleteDirectMessageParticipant({ roomId: directMessage.id, userId: mainUser.id });
    const directMessages = await directMessageCaller.readDirectMessages();

    expect(directMessages.items).toHaveLength(0);
  });

  test("hands the direct message to a remaining participant when its owner leaves", async () => {
    expect.hasAssertions();

    const { directMessage, mainUser, user } = await createDirectMessageWithFriend(mockContext);
    const addedUser = await createMockUser(mockContext.db);
    await createFriends(mockContext, mainUser, addedUser);
    await directMessageCaller.createDirectMessageParticipants({ roomId: directMessage.id, userIds: [addedUser.id] });
    await directMessageCaller.deleteDirectMessageParticipant({ roomId: directMessage.id, userId: mainUser.id });
    const room = await mockContext.db.query.roomsInMessage.findFirst({
      columns: { userId: true },
      where: { id: { eq: directMessage.id } },
    });

    expect([user.id, addedUser.id]).toContain(room?.userId);
    // The members still in the group are told the new owner, or their list keeps the departed one and hides the owner's
    // Controls until a reload
    expect(roomObjectCalls).toContainEqual({
      args: [{ data: { id: directMessage.id, userId: room?.userId }, type: "updateRoom" }],
      method: "notifyOnlineMembers",
      roomId: directMessage.id,
    });
    await expect(
      roomCaller.updateRoom({ id: directMessage.id, isReadOnly: true }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`[TRPCError: UNAUTHORIZED]`);
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

  test("refuses an add whose participants a concurrent add changed before it wrote, and adds no member", async () => {
    expect.hasAssertions();

    const { directMessage, mainUser, user } = await createDirectMessageWithFriend(mockContext);
    const addedUser = await createMockUser(mockContext.db);
    await createFriends(mockContext, mainUser, addedUser);
    const concurrentlyAddedUser = await createMockUser(mockContext.db);
    await createFriends(mockContext, user, concurrentlyAddedUser);
    const userDirectMessageCaller = createCallerFactory(directMessageRouter)(await createUserContext(user));
    onParticipantIdsRead.current = async () => {
      await userDirectMessageCaller.createDirectMessageParticipants({
        roomId: directMessage.id,
        userIds: [concurrentlyAddedUser.id],
      });
    };

    await expect(
      directMessageCaller.createDirectMessageParticipants({ roomId: directMessage.id, userIds: [addedUser.id] }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new InvalidOperationError(Operation.Update, DerivedDatabaseEntityType.DirectMessage, directMessage.id).message}]`,
    );
    const participantIds = await mockContext.db
      .select({ userId: usersToRoomsInMessage.userId })
      .from(usersToRoomsInMessage)
      .where(eq(usersToRoomsInMessage.roomId, directMessage.id));
    const room = await mockContext.db.query.roomsInMessage.findFirst({
      columns: { participantKey: true },
      where: { id: { eq: directMessage.id } },
    });

    expect(participantIds.map(({ userId }) => userId).toSorted()).toStrictEqual(
      [mainUser.id, user.id, concurrentlyAddedUser.id].toSorted(),
    );
    expect(room).toStrictEqual({
      participantKey: getDirectMessageParticipantKey([mainUser.id, user.id, concurrentlyAddedUser.id]),
    });
  });

  test("refuses a removal whose participants a concurrent add changed before it wrote, and keeps the member", async () => {
    expect.hasAssertions();

    const { directMessage, mainUser, user } = await createDirectMessageWithFriend(mockContext);
    const addedUser = await createMockUser(mockContext.db);
    await createFriends(mockContext, mainUser, addedUser);
    await directMessageCaller.createDirectMessageParticipants({ roomId: directMessage.id, userIds: [addedUser.id] });
    const concurrentlyAddedUser = await createMockUser(mockContext.db);
    await createFriends(mockContext, mainUser, concurrentlyAddedUser);
    const userDirectMessageCaller = createCallerFactory(directMessageRouter)(await createUserContext(user));
    onParticipantIdsRead.current = async () => {
      await directMessageCaller.createDirectMessageParticipants({
        roomId: directMessage.id,
        userIds: [concurrentlyAddedUser.id],
      });
    };

    await expect(
      userDirectMessageCaller.deleteDirectMessageParticipant({ roomId: directMessage.id, userId: user.id }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new InvalidOperationError(Operation.Update, DerivedDatabaseEntityType.DirectMessage, directMessage.id).message}]`,
    );
    const participantIds = await mockContext.db
      .select({ userId: usersToRoomsInMessage.userId })
      .from(usersToRoomsInMessage)
      .where(eq(usersToRoomsInMessage.roomId, directMessage.id));
    const room = await mockContext.db.query.roomsInMessage.findFirst({
      columns: { participantKey: true },
      where: { id: { eq: directMessage.id } },
    });

    expect(participantIds.map(({ userId }) => userId).toSorted()).toStrictEqual(
      [mainUser.id, user.id, addedUser.id, concurrentlyAddedUser.id].toSorted(),
    );
    expect(room).toStrictEqual({
      participantKey: getDirectMessageParticipantKey([mainUser.id, user.id, addedUser.id, concurrentlyAddedUser.id]),
    });
  });

  // Another direct message already holds the set of all three, so the add would give this one a key that room holds
  test("refuses adding a participant whose set another direct message already holds, and adds no member", async () => {
    expect.hasAssertions();

    const { directMessage, mainUser, user } = await createDirectMessageWithFriend(mockContext);
    const addedUser = await createMockUser(mockContext.db);
    await createFriends(mockContext, mainUser, addedUser);
    await directMessageCaller.createDirectMessage([user.id, addedUser.id]);

    await expect(
      directMessageCaller.createDirectMessageParticipants({ roomId: directMessage.id, userIds: [addedUser.id] }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`[TRPCError: Another direct message already has these participants]`);
    const participantIds = await mockContext.db
      .select({ userId: usersToRoomsInMessage.userId })
      .from(usersToRoomsInMessage)
      .where(eq(usersToRoomsInMessage.roomId, directMessage.id));

    expect(participantIds.map(({ userId }) => userId).toSorted()).toStrictEqual([mainUser.id, user.id].toSorted());
  });

  test("fails create direct message participant blocked by a participant of the direct message", async () => {
    expect.hasAssertions();

    const { directMessage, mainUser, user } = await createDirectMessageWithFriend(mockContext);
    const addedUser = await createMockUser(mockContext.db);
    await createFriends(mockContext, mainUser, addedUser);
    await createCallerFactory(blockRouter)(await createUserContext(user)).createBlock(addedUser.id);

    await expect(
      directMessageCaller.createDirectMessageParticipants({ roomId: directMessage.id, userIds: [addedUser.id] }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new InvalidOperationError(Operation.Create, DatabaseEntityType.UserToRoom, addedUser.id).message}]`,
    );
  });

  test("fails create direct message participant blocked by a user added before them in the same request", async () => {
    expect.hasAssertions();

    const { directMessage, mainUser } = await createDirectMessageWithFriend(mockContext);
    const firstAddedUser = await createMockUser(mockContext.db);
    await createFriends(mockContext, mainUser, firstAddedUser);
    const secondAddedUser = await createMockUser(mockContext.db);
    await createFriends(mockContext, mainUser, secondAddedUser);
    // The second user blocks the first: the first is admitted, and the block then refuses the second
    await createCallerFactory(blockRouter)(await createUserContext(secondAddedUser)).createBlock(firstAddedUser.id);

    await expect(
      directMessageCaller.createDirectMessageParticipants({
        roomId: directMessage.id,
        userIds: [firstAddedUser.id, secondAddedUser.id],
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new InvalidOperationError(Operation.Create, DatabaseEntityType.UserToRoom, secondAddedUser.id).message}]`,
    );
  });

  test("excludes a room the caller is not a member of from read participants", async () => {
    expect.hasAssertions();

    const { directMessage } = await createDirectMessageWithFriend(mockContext);
    const nonMemberDirectMessageCaller = createCallerFactory(directMessageRouter)(await createUserContext());

    const participantsData = await nonMemberDirectMessageCaller.readDirectMessageParticipants([directMessage.id]);

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
    const nonMemberDirectMessageCaller = createCallerFactory(directMessageRouter)(await createUserContext());

    await expect(nonMemberDirectMessageCaller.hideDirectMessage(newRoom.id)).rejects.toThrowErrorMatchingInlineSnapshot(
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
