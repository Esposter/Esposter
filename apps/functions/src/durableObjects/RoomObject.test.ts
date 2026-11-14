import type { RoomObjectRpc, UserObjectRpc } from "@esposter/db-schema";
import type { Mock } from "vitest";

import { createMockDb } from "@esposter/db-mock";
import { MessageType, roomsInMessage, SOCKET_IDENTITY_HEADER, usersInAuth } from "@esposter/db-schema";
import { takeOne } from "@esposter/shared";
import { eq } from "drizzle-orm";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, test, vi } from "vitest";

import { RoomObject } from "#src/durableObjects/RoomObject";
import {
  createMockObjectState,
  createSocket,
  readFrames,
} from "#src/services/durableObject/createMockObjectState.test";
import { createUser } from "#src/services/shared/createUser.test";
import { ROOM_ACTIVITY_DELAY_MS, ROOM_MEMBER_REMOVED_CODE } from "#src/services/room/constants";

type UserStub = Record<
  "addScheduledMessage" | "addSentMessage" | "removeScheduledMessage" | "removeSentMessage" | "roomActivity",
  Mock
>;

describe(RoomObject, () => {
  let mockDatabase: Awaited<ReturnType<typeof createMockDb>>;
  // Each person's user object as the room reaches it, so a test reads what the room asked each one to do
  const userStubs = new Map<string, UserStub>();
  const getUserStub = (userId: string): UserStub => {
    const existingStub = userStubs.get(userId);
    if (existingStub) return existingStub;

    const stub: UserStub = {
      addScheduledMessage: vi.fn<UserObjectRpc["addScheduledMessage"]>(),
      addSentMessage: vi.fn<UserObjectRpc["addSentMessage"]>(),
      removeScheduledMessage: vi.fn<UserObjectRpc["removeScheduledMessage"]>(),
      removeSentMessage: vi.fn<UserObjectRpc["removeSentMessage"]>(),
      roomActivity: vi.fn<UserObjectRpc["roomActivity"]>(),
    };
    userStubs.set(userId, stub);
    return stub;
  };
  const userNamespace = { get: getUserStub, idFromName: (userId: string) => userId };

  const userId = crypto.randomUUID();
  const otherUserId = crypto.randomUUID();
  const offlineUserId = crypto.randomUUID();
  const deviceId = crypto.randomUUID();
  const otherDeviceId = crypto.randomUUID();
  const actor = { deviceId, userId };
  const otherActor = { deviceId: otherDeviceId, userId: otherUserId };
  const searchAll = { filters: [], limit: 10, offset: 0 };

  let roomId: string;
  let environment: Cloudflare.Env;

  // A room object over a fresh state, named for the seeded room as the web Worker names it
  const createRoomObject = () => {
    const state = createMockObjectState(roomId);
    return { object: new RoomObject(state.ctx as unknown as DurableObjectState, environment), state };
  };

  const sendMessage = (object: RoomObjectRpc, message: string, sender = actor) =>
    object.createMessage({ message, type: MessageType.Message }, sender);

  beforeAll(async () => {
    mockDatabase = await createMockDb();
  });

  afterAll(async () => {
    await mockDatabase.dispose();
  });

  beforeEach(async () => {
    vi.useFakeTimers({ now: 0, toFake: ["Date"] });
    await mockDatabase.db.insert(usersInAuth).values([createUser(userId), createUser(otherUserId)]);
    const room = takeOne(await mockDatabase.db.insert(roomsInMessage).values({ name: "name", userId }).returning());
    roomId = room.id;
    environment = { CORE: mockDatabase.db.$client, USER: userNamespace } as unknown as Cloudflare.Env;
  });

  afterEach(async () => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
    userStubs.clear();
    await mockDatabase.reset();
  });

  test("a write reaches the room's other devices, and not the device that made it", async () => {
    expect.hasAssertions();

    const { object, state } = createRoomObject();
    const senderSocket = createSocket();
    const bystanderSocket = createSocket();
    state.ctx.acceptWebSocket(senderSocket, [`user:${userId}`, `device:${deviceId}`]);
    state.ctx.acceptWebSocket(bystanderSocket, [`user:${otherUserId}`, `device:${otherDeviceId}`]);

    const message = await sendMessage(object, "hello");

    expect(readFrames(senderSocket)).toStrictEqual([]);
    expect(readFrames(bystanderSocket)).toStrictEqual([
      { data: JSON.parse(JSON.stringify([message])), type: "createMessage" },
    ]);
  });

  test("a socket that reconnects with the last id it heard is replayed the messages after it, oldest first", async () => {
    expect.hasAssertions();

    const { object } = createRoomObject();
    const first = await sendMessage(object, "first");
    const second = await sendMessage(object, "second");
    const third = await sendMessage(object, "third");
    const client = createSocket();
    const server = createSocket();
    vi.stubGlobal(
      "WebSocketPair",
      class {
        constructor() {
          return [client, server];
        }
      },
    );
    vi.stubGlobal(
      "Response",
      class {
        constructor(_body: unknown, _init: unknown) {}
      },
    );
    const request = new Request(`https://room.example/ws/room/${roomId}?after=${first.id}`, {
      headers: {
        Upgrade: "websocket",
        [SOCKET_IDENTITY_HEADER.deviceId]: deviceId,
        [SOCKET_IDENTITY_HEADER.sessionId]: crypto.randomUUID(),
        [SOCKET_IDENTITY_HEADER.userId]: userId,
      },
    });

    await object.fetch(request);

    expect(readFrames(server)).toStrictEqual([
      { data: JSON.parse(JSON.stringify([second, third])), type: "createMessage" },
    ]);
  });

  test("search finds a message by its words, follows its edit, and forgets it once deleted", async () => {
    expect.hasAssertions();

    const { object, state } = createRoomObject();
    const message = await sendMessage(object, "hello");

    expect(object.searchMessages({ ...searchAll, query: "hello" })).toStrictEqual({ count: 1, messages: [message] });

    object.updateMessage({ id: message.id, message: "goodbye" }, actor);

    expect(object.searchMessages({ ...searchAll, query: "hello" }).count).toBe(0);
    expect(object.searchMessages({ ...searchAll, query: "goodbye" }).count).toBe(1);

    await object.deleteMessage(message.id, actor);

    expect(object.searchMessages({ ...searchAll, query: "goodbye" })).toStrictEqual({ count: 0, messages: [] });
    // The row is filtered out of a search by its tombstone, so the index itself is read to see that it forgot the words
    expect(
      state.database
        .prepare("select count(*) as count from messages_search where messages_search match ?")
        .get("goodbye")?.count,
    ).toBe(0);
  });

  test("a reaction gathers its reactors, and the last one to leave takes it away", async () => {
    expect.hasAssertions();

    const { object } = createRoomObject();
    const message = await sendMessage(object, "hello");
    const emojiTag = crypto.randomUUID();
    const reaction = { emojiTag, messageId: message.id };

    object.addReaction(reaction, actor);
    object.addReaction(reaction, otherActor);

    expect(object.readReactions([message.id])).toStrictEqual([
      { emojiTag, messageId: message.id, userIds: [userId, otherUserId] },
    ]);

    object.removeReaction(reaction, actor);
    object.removeReaction(reaction, otherActor);

    expect(object.readReactions([message.id])).toStrictEqual([]);
  });

  test("a vote is recorded on the poll's stored body, and withdrawn when no option is named", async () => {
    expect.hasAssertions();

    const { object } = createRoomObject();
    const optionId = crypto.randomUUID();
    const poll = await object.createMessage(
      {
        message: JSON.stringify({ options: [{ id: optionId, label: "label" }], question: "question", votes: {} }),
        type: MessageType.Poll,
      },
      actor,
    );

    expect(object.votePoll({ id: poll.id, optionId }, otherActor)?.message).toBe(
      JSON.stringify({
        options: [{ id: optionId, label: "label" }],
        question: "question",
        votes: { [otherUserId]: optionId },
      }),
    );

    expect(object.votePoll({ id: poll.id }, otherActor)?.message).toBe(
      JSON.stringify({ options: [{ id: optionId, label: "label" }], question: "question", votes: {} }),
    );
  });

  test("a scheduled message is sent once when it comes due, and the alarm is armed for the one after", async () => {
    expect.hasAssertions();

    const { object, state } = createRoomObject();
    const due = await object.createScheduledMessage(
      { id: crypto.randomUUID(), message: "due", runAt: new Date(ROOM_ACTIVITY_DELAY_MS) },
      actor,
    );
    const later = await object.createScheduledMessage(
      { id: crypto.randomUUID(), message: "later", runAt: new Date(ROOM_ACTIVITY_DELAY_MS * 2) },
      actor,
    );
    expect(await state.ctx.storage.getAlarm()).toBe(due.runAt.getTime());

    vi.setSystemTime(due.runAt);
    await object.alarm();

    expect(
      object.readMessages({ limit: 10 }).map(({ message, userId: sender }) => ({ message, userId: sender })),
    ).toStrictEqual([{ message: "due", userId }]);
    expect(object.readScheduledMessages(userId)).toStrictEqual([later]);
    expect(getUserStub(userId).removeScheduledMessage).toHaveBeenCalledExactlyOnceWith(due.id);
    expect(await state.ctx.storage.getAlarm()).toBe(later.runAt.getTime());
  });

  test("the room-activity wave reaches only the members online, once per window, and writes the room's updatedAt", async () => {
    expect.hasAssertions();

    const { object, state } = createRoomObject();
    object.attachMember(userId);
    object.attachMember(otherUserId);
    await sendMessage(object, "first");
    vi.setSystemTime(new Date(ROOM_ACTIVITY_DELAY_MS / 4));
    const last = await sendMessage(object, "second");

    expect(await state.ctx.storage.getAlarm()).toBe(ROOM_ACTIVITY_DELAY_MS);

    vi.setSystemTime(new Date(ROOM_ACTIVITY_DELAY_MS));
    await object.alarm();
    await object.alarm();

    expect(getUserStub(userId).roomActivity).toHaveBeenCalledExactlyOnceWith(roomId, last.createdAt);
    expect(getUserStub(otherUserId).roomActivity).toHaveBeenCalledExactlyOnceWith(roomId, last.createdAt);
    expect(userStubs.has(offlineUserId)).toBe(false);

    const [room] = await mockDatabase.db
      .select({ updatedAt: roomsInMessage.updatedAt })
      .from(roomsInMessage)
      .where(eq(roomsInMessage.id, roomId));
    expect(room?.updatedAt).toStrictEqual(last.createdAt);
  });

  test("erasing a person's messages blanks what they said and leaves the rest, and their export pages by id", async () => {
    expect.hasAssertions();

    const { object } = createRoomObject();
    const first = await sendMessage(object, "first");
    const bystander = await sendMessage(object, "bystander", otherActor);
    const last = await sendMessage(object, "last");

    expect(object.exportUserMessages({ limit: 1, userId })).toStrictEqual([first]);
    expect(object.exportUserMessages({ after: first.id, limit: 1, userId })).toStrictEqual([last]);

    expect(await object.deleteUserMessages(userId)).toStrictEqual([first, last]);

    expect(object.readMessages({ limit: 10 })).toStrictEqual([bystander]);
    expect(object.searchMessages({ ...searchAll, query: "first" }).count).toBe(0);
    expect(getUserStub(userId).removeSentMessage).toHaveBeenCalledTimes(2);
  });

  test("deleting the room closes its sockets and clears its alarm", async () => {
    expect.hasAssertions();

    const { object, state } = createRoomObject();
    const socket = createSocket();
    state.ctx.acceptWebSocket(socket, [`user:${userId}`, `device:${deviceId}`]);
    await sendMessage(object, "hello");

    await object.deleteAll();

    expect(socket.close).toHaveBeenCalledExactlyOnceWith(1000, "Room deleted");
    expect(await state.ctx.storage.getAlarm()).toBeNull();
  });

  test("a member coming online and going offline is announced to the room once each", async () => {
    expect.hasAssertions();

    const { object, state } = createRoomObject();
    const socket = createSocket();
    state.ctx.acceptWebSocket(socket, [`user:${userId}`, `device:${deviceId}`]);

    object.attachMember(otherUserId);
    object.attachMember(otherUserId);
    object.detachMember(otherUserId);
    object.detachMember(otherUserId);

    expect(readFrames(socket)).toStrictEqual([
      { data: { userId: otherUserId }, type: "memberOnline" },
      { data: { userId: otherUserId }, type: "memberOffline" },
    ]);
  });

  test("removing a member closes that member's sockets and no other", async () => {
    expect.hasAssertions();

    const { object, state } = createRoomObject();
    const memberSocket = createSocket();
    const bystanderSocket = createSocket();
    state.ctx.acceptWebSocket(memberSocket, [`user:${otherUserId}`, `device:${otherDeviceId}`]);
    state.ctx.acceptWebSocket(bystanderSocket, [`user:${userId}`, `device:${deviceId}`]);

    object.removeMember(otherUserId);

    expect(memberSocket.close).toHaveBeenCalledExactlyOnceWith(ROOM_MEMBER_REMOVED_CODE, "Removed from the room");
    expect(bystanderSocket.close).not.toHaveBeenCalled();
  });
});
