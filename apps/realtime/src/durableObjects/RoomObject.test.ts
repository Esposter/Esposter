import type { PageCursor, RoomObjectRpc, RoomReaction, UserObjectRpc } from "@esposter/db-schema";
import type { Mock } from "vitest";

import { RoomObject } from "#src/durableObjects/RoomObject";
import {
  createMockObjectState,
  createSocket,
  readFrames,
} from "#src/services/durableObject/createMockObjectState.test";
import { ROOM_ACTIVITY_DELAY_MS, ROOM_MEMBER_REMOVED_CODE, WRITE_RETRY_DELAY_MS } from "#src/services/room/constants";
import { createUser } from "#src/services/shared/createUser.test";
import { toMergedPage } from "@esposter/db";
import { createMockDb } from "@esposter/db-mock";
import {
  AppNotificationType,
  appUsersInMessage,
  createPageInputSchema,
  getRoomSearchPageSort,
  MessageType,
  RoomPermission,
  roomRolesInMessage,
  roomsInMessage,
  SOCKET_IDENTITY_HEADER,
  START_PAGE_CURSOR,
  threadFollowsInMessage,
  usersInAuth,
  usersToRoomsInMessage,
} from "@esposter/db-schema";
import { takeOne } from "@esposter/shared";
import { and, eq } from "drizzle-orm";
import { v7 } from "uuid";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, test, vi } from "vitest";

type UserStub = Record<
  | "addScheduledMessage"
  | "addSentMessage"
  | "broadcastEvent"
  | "removeScheduledMessage"
  | "removeSentMessages"
  | "removeSentMessagesInRoom"
  | "roomActivity"
  | "updateUserToRoom",
  Mock
>;

// The Response the object builds for an upgrade. The test reads no part of it, so the stub builds nothing
const ResponseStub = function () {};

// A message whose text mentions one member, as the editor writes a mention
const mentioning = (mentionedUserId: string) =>
  `<p><span data-type="mention" data-id="${mentionedUserId}">@member</span></p>`;

// A reaction's key, which is how a reaction is paged
const toReactionKey = ({ emojiTag, messageId }: RoomReaction) => ({ emojiTag, messageId });

// A member's status as the room is sent it when the member comes online or goes offline
const createStatus = (statusUserId: string, isConnected: boolean) => ({
  createdAt: new Date(0),
  deletedAt: null,
  expiresAt: null,
  isConnected,
  message: "",
  status: null,
  updatedAt: new Date(0),
  userId: statusUserId,
});

// A search read as the web merges it: each room answers its matches after the cursor, and the merged page keeps `limit`
const readSearchPage = (
  rooms: { object: RoomObjectRpc; roomId: string }[],
  query: string,
  cursor: PageCursor,
  limit: number,
) =>
  toMergedPage(
    rooms.map((room) =>
      room.object
        .searchMessages({ cursor, filters: [], isCounted: false, limit: limit + 1, query })
        .messages.map((message) => ({ ...message, roomId: room.roomId })),
    ),
    getRoomSearchPageSort(query),
    cursor,
    limit,
  );

// Every match of a search, read a page at a time from the cursor each page answered
const readSearchIds = (rooms: { object: RoomObjectRpc; roomId: string }[], query: string, limit: number) => {
  const sort = getRoomSearchPageSort(query);
  const matches: { id: number; roomId: string }[] = [];
  let encodedCursor = "";
  do {
    const cursor = createPageInputSchema(sort).parse({ cursor: encodedCursor, limit }).cursor;
    const page = readSearchPage(rooms, query, cursor, limit);
    matches.push(...page.items.map(({ id, roomId: matchRoomId }) => ({ id, roomId: matchRoomId })));
    encodedCursor = page.nextCursor;
  } while (encodedCursor);
  return matches;
};

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
      broadcastEvent: vi.fn<UserObjectRpc["broadcastEvent"]>(),
      removeScheduledMessage: vi.fn<UserObjectRpc["removeScheduledMessage"]>(),
      removeSentMessages: vi.fn<UserObjectRpc["removeSentMessages"]>(),
      removeSentMessagesInRoom: vi.fn<UserObjectRpc["removeSentMessagesInRoom"]>(),
      roomActivity: vi.fn<UserObjectRpc["roomActivity"]>(),
      updateUserToRoom: vi.fn<UserObjectRpc["updateUserToRoom"]>(),
    };
    userStubs.set(userId, stub);
    return stub;
  };
  const userNamespace = { get: getUserStub, idFromName: (userId: string) => userId };

  const userId = v7();
  const otherUserId = v7();
  const offlineUserId = v7();
  const deviceId = v7();
  const otherDeviceId = v7();
  const actor = { deviceId, userId };
  const otherActor = { deviceId: otherDeviceId, userId: otherUserId };
  const newestPage = { cursor: START_PAGE_CURSOR, limit: 10 };
  const searchAll = { cursor: START_PAGE_CURSOR, filters: [], isCounted: true, limit: 10 };

  let roomId: string;
  let environment: Cloudflare.Env;

  // A room object over a fresh state, named for the seeded room as the web Worker names it
  const createRoomObject = () => {
    const state = createMockObjectState(roomId);
    return { object: new RoomObject(state.ctx as unknown as DurableObjectState, environment), state };
  };

  const sendMessage = (object: RoomObjectRpc, message: string, sender = actor) =>
    object.createMessage({ message, type: MessageType.Message }, sender);
  const readMentionCount = async (mentionedUserId: string) => {
    const [row] = await mockDatabase.db
      .select({ mentionCount: usersToRoomsInMessage.mentionCount })
      .from(usersToRoomsInMessage)
      .where(and(eq(usersToRoomsInMessage.roomId, roomId), eq(usersToRoomsInMessage.userId, mentionedUserId)));
    return row?.mentionCount;
  };

  beforeAll(async () => {
    mockDatabase = await createMockDb();
  });

  beforeEach(async () => {
    vi.useFakeTimers({ now: 0, toFake: ["Date"] });
    await mockDatabase.db.insert(usersInAuth).values([createUser(userId), createUser(otherUserId)]);
    const room = takeOne(await mockDatabase.db.insert(roomsInMessage).values({ name: "name", userId }).returning());
    roomId = room.id;
    await mockDatabase.db.insert(usersToRoomsInMessage).values([
      { roomId, userId },
      { roomId, userId: otherUserId },
    ]);
    // The @everyone role every member holds, seeded with the send permission `createRoom` gives it
    await mockDatabase.db
      .insert(roomRolesInMessage)
      .values({ isEveryone: true, name: "name", permissions: RoomPermission.SendMessages, roomId });
    environment = { CORE: mockDatabase.coreDatabase, USER: userNamespace } as unknown as Cloudflare.Env;
  });

  afterEach(async () => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
    userStubs.clear();
    await mockDatabase.reset();
  });

  afterAll(async () => {
    await mockDatabase.dispose();
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
    expect(readFrames(bystanderSocket)).toStrictEqual([{ data: structuredClone([message]), type: "createMessage" }]);
  });

  test("a webhook message keeps the image its app user had when it sent", async () => {
    expect.hasAssertions();

    const appUserId = v7();
    await mockDatabase.db.insert(appUsersInMessage).values({ id: appUserId, image: "https://example.com/hook.png" });
    const { object } = createRoomObject();
    const message = await object.createWebhookMessage({
      appUserId,
      appUserImage: "",
      deliveryId: v7(),
      message: "from a hook",
      senderName: "hook",
    });

    expect(message.appUserImage).toBe("https://example.com/hook.png");
    expect(object.readMessages(newestPage)).toStrictEqual([message]);
  });

  test("a webhook message keeps the avatar its push names, over its identity's image", async () => {
    expect.hasAssertions();

    const { object } = createRoomObject();
    await object.createWebhookMessage({
      appUserId: v7(),
      appUserImage: "https://example.com/avatar.png",
      deliveryId: v7(),
      message: "from a hook",
    });

    expect(object.readMessages(newestPage)[0]?.appUserImage).toBe("https://example.com/avatar.png");
  });

  test("a webhook message is notified once, however many times its delivery is made", async () => {
    expect.hasAssertions();

    const queue = { send: vi.fn<(message: unknown) => Promise<void>>(() => Promise.resolve()) };
    environment = { ...environment, PROCESS_NOTIFICATION_QUEUE: queue } as unknown as Cloudflare.Env;
    const appUserId = v7();
    await mockDatabase.db.insert(appUsersInMessage).values({ id: appUserId, image: "" });
    const { object } = createRoomObject();
    const input = { appUserId, appUserImage: "", deliveryId: v7(), message: "from a hook", senderName: "hook" };
    const message = await object.createWebhookMessage(input);
    await object.createWebhookMessage(input);

    expect(queue.send).toHaveBeenCalledExactlyOnceWith({
      appUserId,
      message: { id: message.id, message: "from a hook", roomId, userId: null },
      threadRootId: null,
      type: AppNotificationType.Message,
    });
  });

  test("a viewer of the room is sent the tombstone of each message an erase removes, and keeps it as deleted", async () => {
    expect.hasAssertions();

    const { object, state } = createRoomObject();
    const viewerSocket = createSocket();
    state.ctx.acceptWebSocket(viewerSocket, [`user:${otherUserId}`, `device:${otherDeviceId}`]);
    const message = await sendMessage(object, "erased soon");

    await object.deleteUserMessages({ limit: 10, userId });

    const tombstone = readFrames(viewerSocket).at(-1);
    expect(tombstone.type).toBe("deleteMessage");
    expect(tombstone.data.id).toBe(message.id);
    expect(tombstone.data.deletedAt).toStrictEqual(new Date(0));
    expect(tombstone.data.message).toBe("");
  });

  test("a socket that reconnects with the last id it heard is replayed the messages after it, oldest first", async () => {
    expect.hasAssertions();

    const { object } = createRoomObject();
    const first = await sendMessage(object, "first");
    const second = await sendMessage(object, "second");
    const third = await sendMessage(object, "third");
    const client = createSocket();
    const server = createSocket();
    const WebSocketPair = function () {
      return [client, server];
    };
    vi.stubGlobal("WebSocketPair", WebSocketPair);
    vi.stubGlobal("Response", ResponseStub);
    const request = new Request(`https://room.example/ws/room/${roomId}?after=${first.id}`, {
      headers: {
        [SOCKET_IDENTITY_HEADER.deviceId]: deviceId,
        [SOCKET_IDENTITY_HEADER.sessionExpiresAt]: String(Number.MAX_SAFE_INTEGER),
        [SOCKET_IDENTITY_HEADER.sessionId]: v7(),
        [SOCKET_IDENTITY_HEADER.userId]: userId,
        Upgrade: "websocket",
      },
    });

    await object.fetch(request);

    expect(readFrames(server)).toStrictEqual([{ data: structuredClone([second, third]), type: "createMessage" }]);
  });

  test("search finds a message by its words, follows its edit, and forgets it once deleted", async () => {
    expect.hasAssertions();

    const { object, state } = createRoomObject();
    const message = await sendMessage(object, "hello");

    expect(object.searchMessages({ ...searchAll, query: "hello" })).toStrictEqual({
      count: 1,
      messages: [{ ...message, rank: 1 }],
    });

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
    const emojiTag = v7();
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
    const optionId = v7();
    // A label is free text, so one shaped like a timestamp is written back as it was typed rather than as a Date
    const label = "1970-01-01T00:00:00Z";
    const poll = await object.createMessage(
      {
        message: JSON.stringify({ options: [{ id: optionId, label }], question: "question", votes: {} }),
        type: MessageType.Poll,
      },
      actor,
    );

    expect(object.votePoll({ id: poll.id, optionId }, otherActor)?.message).toBe(
      JSON.stringify({ options: [{ id: optionId, label }], question: "question", votes: { [otherUserId]: optionId } }),
    );

    expect(object.votePoll({ id: poll.id }, otherActor)?.message).toBe(
      JSON.stringify({ options: [{ id: optionId, label }], question: "question", votes: {} }),
    );
  });

  test("a pin and a vote each move the message's updatedAt, so a socket that reconnects finds the change", async () => {
    expect.hasAssertions();

    const { object } = createRoomObject();
    const optionId = v7();
    const poll = await object.createMessage(
      {
        message: JSON.stringify({ options: [{ id: optionId, label: "label" }], question: "question", votes: {} }),
        type: MessageType.Poll,
      },
      actor,
    );

    vi.setSystemTime(Temporal.Instant.fromEpochMilliseconds(ROOM_ACTIVITY_DELAY_MS));
    expect(object.pinMessage(poll.id, actor)?.updatedAt).toStrictEqual(new Date(ROOM_ACTIVITY_DELAY_MS));

    vi.setSystemTime(Temporal.Instant.fromEpochMilliseconds(ROOM_ACTIVITY_DELAY_MS * 2));
    expect(object.votePoll({ id: poll.id, optionId }, otherActor)?.updatedAt).toStrictEqual(
      new Date(ROOM_ACTIVITY_DELAY_MS * 2),
    );
  });

  test("an edit sets the message's editedAt to the edit's time, and a message never edited has none", async () => {
    expect.hasAssertions();

    const { object } = createRoomObject();
    const message = await sendMessage(object, "hello");
    expect(message.editedAt).toBeNull();

    vi.setSystemTime(Temporal.Instant.fromEpochMilliseconds(ROOM_ACTIVITY_DELAY_MS));
    const editedMessage = object.updateMessage({ id: message.id, message: "edited" }, actor);
    expect(editedMessage?.editedAt).toStrictEqual(new Date(ROOM_ACTIVITY_DELAY_MS));
    expect(editedMessage?.updatedAt).toStrictEqual(new Date(ROOM_ACTIVITY_DELAY_MS));
  });

  test("an edit names the members its new text names, when its caller names none", async () => {
    expect.hasAssertions();

    const { object } = createRoomObject();
    const message = await sendMessage(object, "hello");

    object.updateMessage({ id: message.id, message: mentioning(otherUserId) }, actor);

    expect(object.readMessages(newestPage)[0]?.mentions).toStrictEqual([otherUserId]);
  });

  test("an edit of a webhook message names nobody, as its send names nobody", async () => {
    expect.hasAssertions();

    const { object } = createRoomObject();
    const message = await object.createWebhookMessage({
      appUserId: v7(),
      appUserImage: "",
      deliveryId: v7(),
      message: "from a hook",
    });

    object.updateMessage({ id: message.id, message: mentioning(otherUserId) }, actor);

    expect(object.readMessages(newestPage)[0]?.mentions).toStrictEqual([]);
  });

  test("a scheduled message is sent once when it comes due, and the alarm is armed for the one after", async () => {
    expect.hasAssertions();

    const { object, state } = createRoomObject();
    const due = await object.createScheduledMessage(
      { id: v7(), message: "due", runAt: new Date(ROOM_ACTIVITY_DELAY_MS) },
      actor,
    );
    const later = await object.createScheduledMessage(
      { id: v7(), message: "later", runAt: new Date(ROOM_ACTIVITY_DELAY_MS * 2) },
      actor,
    );
    await expect(state.ctx.storage.getAlarm()).resolves.toBe(due.runAt.getTime());

    vi.setSystemTime(Temporal.Instant.fromEpochMilliseconds(due.runAt.getTime()));
    await object.alarm();

    expect(
      object.readMessages(newestPage).map(({ message, userId: sender }) => ({ message, userId: sender })),
    ).toStrictEqual([{ message: "due", userId }]);
    expect(object.readScheduledMessages({ ids: [later.id], userId })).toStrictEqual([later]);
    expect(getUserStub(userId).removeScheduledMessage).toHaveBeenCalledExactlyOnceWith(due.id);
    await expect(state.ctx.storage.getAlarm()).resolves.toBe(later.runAt.getTime());
  });

  test("a scheduled message names the members its text mentions, and counts each one's mention as a live send does", async () => {
    expect.hasAssertions();

    const { object } = createRoomObject();
    const scheduledMessage = await object.createScheduledMessage(
      { id: v7(), message: mentioning(otherUserId), runAt: new Date(ROOM_ACTIVITY_DELAY_MS) },
      actor,
    );

    vi.setSystemTime(Temporal.Instant.fromEpochMilliseconds(scheduledMessage.runAt.getTime()));
    await object.alarm();

    expect(object.readMessages(newestPage)[0]?.mentions).toStrictEqual([otherUserId]);
    await expect(readMentionCount(otherUserId)).resolves.toBe(1);
    expect(getUserStub(otherUserId).updateUserToRoom).toHaveBeenCalledTimes(1);
    expect(getUserStub(otherUserId).updateUserToRoom.mock.lastCall?.[0]?.mentionCount).toBe(1);
  });

  test("a live message that mentions a member counts it for them, and never for its sender", async () => {
    expect.hasAssertions();

    const { object } = createRoomObject();
    await sendMessage(object, mentioning(otherUserId));
    await sendMessage(object, mentioning(userId));

    await expect(readMentionCount(otherUserId)).resolves.toBe(1);
    await expect(readMentionCount(userId)).resolves.toBe(0);
  });

  test("a scheduled reply follows its thread for its sender and for the root's author", async () => {
    expect.hasAssertions();

    const { object } = createRoomObject();
    const root = await sendMessage(object, "root", otherActor);
    const reply = await object.createScheduledMessage(
      { id: v7(), message: "reply", replyToId: root.id, runAt: new Date(ROOM_ACTIVITY_DELAY_MS) },
      actor,
    );

    vi.setSystemTime(Temporal.Instant.fromEpochMilliseconds(reply.runAt.getTime()));
    await object.alarm();

    const follows = await mockDatabase.db
      .select({ userId: threadFollowsInMessage.userId })
      .from(threadFollowsInMessage)
      .where(and(eq(threadFollowsInMessage.roomId, roomId), eq(threadFollowsInMessage.threadRootId, root.id)));
    expect(follows.map(({ userId: followerId }) => followerId).toSorted()).toStrictEqual(
      [userId, otherUserId].toSorted(),
    );
  });

  test("a scheduled reply is notified to its thread's followers once it is sent", async () => {
    expect.hasAssertions();

    const queue = { send: vi.fn<(message: unknown) => Promise<void>>(() => Promise.resolve()) };
    environment = { ...environment, PROCESS_NOTIFICATION_QUEUE: queue } as unknown as Cloudflare.Env;
    const { object } = createRoomObject();
    const root = await sendMessage(object, "root", otherActor);
    const reply = await object.createScheduledMessage(
      { id: v7(), message: "reply", replyToId: root.id, runAt: new Date(ROOM_ACTIVITY_DELAY_MS) },
      actor,
    );

    vi.setSystemTime(Temporal.Instant.fromEpochMilliseconds(reply.runAt.getTime()));
    await object.alarm();

    const sentReply = takeOne(object.readMessages({ cursor: START_PAGE_CURSOR, limit: 1 }));
    expect(queue.send).toHaveBeenCalledExactlyOnceWith({
      message: { id: sentReply.id, message: "reply", roomId, userId },
      threadRootId: root.id,
      type: AppNotificationType.Message,
    });
  });

  test("a scheduled message is dropped, not sent, when its sender has left the room by the time it comes due", async () => {
    expect.hasAssertions();

    const { object } = createRoomObject();
    const scheduledMessage = await object.createScheduledMessage(
      { id: v7(), message: "left", runAt: new Date(ROOM_ACTIVITY_DELAY_MS) },
      actor,
    );
    await mockDatabase.db
      .delete(usersToRoomsInMessage)
      .where(and(eq(usersToRoomsInMessage.roomId, roomId), eq(usersToRoomsInMessage.userId, userId)));

    vi.setSystemTime(Temporal.Instant.fromEpochMilliseconds(scheduledMessage.runAt.getTime()));
    await object.alarm();

    expect(object.readMessages(newestPage)).toStrictEqual([]);
    expect(object.readScheduledMessages({ ids: [scheduledMessage.id], userId })).toStrictEqual([]);
    expect(getUserStub(userId).removeScheduledMessage).toHaveBeenCalledExactlyOnceWith(scheduledMessage.id);
  });

  test("a scheduled message is dropped, not sent, when its sender is timed out at the time it comes due", async () => {
    expect.hasAssertions();

    const { object } = createRoomObject();
    const scheduledMessage = await object.createScheduledMessage(
      { id: v7(), message: "timed out", runAt: new Date(ROOM_ACTIVITY_DELAY_MS) },
      actor,
    );
    await mockDatabase.db
      .update(usersToRoomsInMessage)
      .set({ timeoutUntil: new Date(ROOM_ACTIVITY_DELAY_MS * 2) })
      .where(and(eq(usersToRoomsInMessage.roomId, roomId), eq(usersToRoomsInMessage.userId, userId)));

    vi.setSystemTime(Temporal.Instant.fromEpochMilliseconds(scheduledMessage.runAt.getTime()));
    await object.alarm();

    expect(object.readMessages(newestPage)).toStrictEqual([]);
    expect(object.readScheduledMessages({ ids: [scheduledMessage.id], userId })).toStrictEqual([]);
  });

  test("a scheduled message is dropped, not sent, when its sender no longer holds the permission to send", async () => {
    expect.hasAssertions();

    // The room's owner holds every permission, so the sender is the other member, who holds only the @everyone role
    const { object } = createRoomObject();
    const scheduledMessage = await object.createScheduledMessage(
      { id: v7(), message: "no permission", runAt: new Date(ROOM_ACTIVITY_DELAY_MS) },
      otherActor,
    );
    await mockDatabase.db.delete(roomRolesInMessage).where(eq(roomRolesInMessage.roomId, roomId));

    vi.setSystemTime(Temporal.Instant.fromEpochMilliseconds(scheduledMessage.runAt.getTime()));
    await object.alarm();

    expect(object.readMessages(newestPage)).toStrictEqual([]);
    expect(object.readScheduledMessages({ ids: [scheduledMessage.id], userId: otherUserId })).toStrictEqual([]);
  });

  test("the room-activity wave reaches only the members online, once per window, and writes the room's lastMessageAt", async () => {
    expect.hasAssertions();

    const { object, state } = createRoomObject();
    object.attachMember(userId, createStatus(userId, true));
    object.attachMember(otherUserId, createStatus(otherUserId, true));
    await sendMessage(object, "first");
    vi.setSystemTime(Temporal.Instant.fromEpochMilliseconds(0).add({ milliseconds: ROOM_ACTIVITY_DELAY_MS / 4 }));
    const last = await sendMessage(object, "second");

    await expect(state.ctx.storage.getAlarm()).resolves.toBe(ROOM_ACTIVITY_DELAY_MS);

    vi.setSystemTime(Temporal.Instant.fromEpochMilliseconds(ROOM_ACTIVITY_DELAY_MS));
    await object.alarm();
    await object.alarm();

    expect(getUserStub(userId).roomActivity).toHaveBeenCalledExactlyOnceWith(roomId, last.createdAt);
    expect(getUserStub(otherUserId).roomActivity).toHaveBeenCalledExactlyOnceWith(roomId, last.createdAt);
    expect(userStubs.has(offlineUserId)).toBe(false);

    const [room] = await mockDatabase.db
      .select({ lastMessageAt: roomsInMessage.lastMessageAt })
      .from(roomsInMessage)
      .where(eq(roomsInMessage.id, roomId));
    expect(room?.lastMessageAt).toStrictEqual(last.createdAt);
  });

  test("a message sent while the wave writes owes a wave of its own", async () => {
    expect.hasAssertions();

    const writeStarted = Promise.withResolvers<void>();
    const writeReleased = Promise.withResolvers<void>();
    // The wave's write to the room row is held in flight, so a send lands between the wave being taken and its write
    const holdStatement = (statement: D1PreparedStatement): D1PreparedStatement =>
      new Proxy(statement, {
        get: (target, key) => {
          if (key === "bind") return (...values: unknown[]) => holdStatement(target.bind(...values));
          if (key === "run")
            return async () => {
              writeStarted.resolve();
              await writeReleased.promise;
              return target.run();
            };
          const value: unknown = Reflect.get(target, key);
          return typeof value === "function" ? value.bind(target) : value;
        },
      });
    const core = mockDatabase.coreDatabase;
    environment = {
      ...environment,
      CORE: new Proxy(core, {
        get: (target, key) => {
          if (key !== "prepare") {
            const value: unknown = Reflect.get(target, key);
            return typeof value === "function" ? value.bind(target) : value;
          }
          return (query: string) =>
            query.startsWith('update "message_rooms"') ? holdStatement(target.prepare(query)) : target.prepare(query);
        },
      }),
    };
    const { object } = createRoomObject();
    object.attachMember(userId, createStatus(userId, true));
    const first = await sendMessage(object, "first");
    vi.setSystemTime(Temporal.Instant.fromEpochMilliseconds(ROOM_ACTIVITY_DELAY_MS));
    const wave = object.alarm();
    await writeStarted.promise;
    const second = await sendMessage(object, "second");
    writeReleased.resolve();
    await wave;
    vi.setSystemTime(Temporal.Instant.fromEpochMilliseconds(ROOM_ACTIVITY_DELAY_MS * 2));
    await object.alarm();

    expect(vi.mocked(getUserStub(userId).roomActivity).mock.calls).toStrictEqual([
      [roomId, first.createdAt],
      [roomId, second.createdAt],
    ]);
  });

  test("a room-list event reaches only the members online here, each through its own object", async () => {
    expect.hasAssertions();

    const { object } = createRoomObject();
    object.attachMember(userId, createStatus(userId, true));
    const leaveEvent = { data: { roomId, userId: otherUserId }, type: "leaveRoom" } as const;
    await object.notifyOnlineMembers(leaveEvent);

    expect(getUserStub(userId).broadcastEvent).toHaveBeenCalledExactlyOnceWith(leaveEvent);
    expect(userStubs.has(otherUserId)).toBe(false);
  });

  test("a read is the live messages after its cursor in the room's order, and a backward cursor reads the newer ones oldest first", async () => {
    expect.hasAssertions();

    const { object } = createRoomObject();
    const first = await sendMessage(object, "first");
    const second = await sendMessage(object, "second");
    const deleted = await sendMessage(object, "deleted");
    const third = await sendMessage(object, "third");
    await object.deleteMessage(deleted.id, actor);

    expect(object.readMessages(newestPage)).toStrictEqual([third, second, first]);
    expect(object.readMessages({ cursor: { isBackward: false, values: [third.id] }, limit: 10 })).toStrictEqual([
      second,
      first,
    ]);
    expect(object.readMessages({ cursor: { isBackward: false, values: [second.id] }, limit: 1 })).toStrictEqual([
      first,
    ]);
    expect(object.readMessages({ cursor: { isBackward: true, values: [first.id] }, limit: 10 })).toStrictEqual([
      second,
      third,
    ]);
  });

  test("a thread is read back as its root and then its replies in the order they were sent, and a message outside it is left out", async () => {
    expect.hasAssertions();

    const { object } = createRoomObject();
    const root = await sendMessage(object, "root");
    const firstReply = await object.createMessage(
      { message: "first reply", replyToId: root.id, type: MessageType.Message },
      actor,
    );
    // A message outside the thread, sent between its replies, is left out of the read
    await sendMessage(object, "outside");
    const secondReply = await object.createMessage(
      { message: "second reply", replyToId: root.id, type: MessageType.Message },
      actor,
    );

    expect(object.readThread(root.id)).toStrictEqual([root, firstReply, secondReply]);
  });

  test("erasing a person's messages is paged: each page blanks what they said, leaves their index, and continues after its last id", async () => {
    expect.hasAssertions();

    const { object } = createRoomObject();
    const first = await sendMessage(object, "first");
    const second = await sendMessage(object, "second");
    const bystander = await sendMessage(object, "bystander", otherActor);
    const third = await sendMessage(object, "third");

    expect(object.exportUserMessages({ limit: 1, userId })).toStrictEqual([first]);
    expect(object.exportUserMessages({ after: first.id, limit: 1, userId })).toStrictEqual([second]);

    await expect(object.deleteUserMessages({ limit: 2, userId })).resolves.toStrictEqual([first, second]);
    expect(getUserStub(userId).removeSentMessages).toHaveBeenCalledExactlyOnceWith({
      messageIds: [first.id, second.id],
      roomId,
    });
    // The page that ends the erase is short of its limit
    await expect(object.deleteUserMessages({ after: second.id, limit: 2, userId })).resolves.toStrictEqual([third]);
    expect(getUserStub(userId).removeSentMessages).toHaveBeenLastCalledWith({ messageIds: [third.id], roomId });

    expect(object.readMessages(newestPage)).toStrictEqual([bystander]);
    expect(object.searchMessages({ ...searchAll, query: "first" }).count).toBe(0);
  });

  test("a person's reactions are read and erased a page at a time, in the order of their message and emoji", async () => {
    expect.hasAssertions();

    const { object } = createRoomObject();
    const message = await sendMessage(object, "hello");
    const otherMessage = await sendMessage(object, "again");
    object.addReaction({ emojiTag: "a", messageId: message.id }, actor);
    object.addReaction({ emojiTag: "b", messageId: message.id }, actor);
    // Another reactor on the first emoji keeps its reaction when the person leaves it
    object.addReaction({ emojiTag: "a", messageId: message.id }, otherActor);
    object.addReaction({ emojiTag: "a", messageId: otherMessage.id }, actor);

    expect(object.exportUserReactions({ limit: 2, userId }).map((reaction) => toReactionKey(reaction))).toStrictEqual([
      { emojiTag: "a", messageId: message.id },
      { emojiTag: "b", messageId: message.id },
    ]);
    expect(object.deleteUserReactions({ limit: 2, userId }).map((reaction) => toReactionKey(reaction))).toStrictEqual([
      { emojiTag: "a", messageId: message.id },
      { emojiTag: "b", messageId: message.id },
    ]);
    expect(
      object
        .deleteUserReactions({ after: { emojiTag: "b", messageId: message.id }, limit: 2, userId })
        .map((reaction) => toReactionKey(reaction)),
    ).toStrictEqual([{ emojiTag: "a", messageId: otherMessage.id }]);
    expect(object.readReactions([message.id, otherMessage.id])).toStrictEqual([
      { emojiTag: "a", messageId: message.id, userIds: [otherUserId] },
    ]);
  });

  test("a search without text reads to its end across a page boundary, newest first, with the message times tied", async () => {
    expect.hasAssertions();

    const { object } = createRoomObject();
    // Every message is sent at the same instant, so each page boundary falls inside a tie on time
    const messages = [
      await sendMessage(object, "first"),
      await sendMessage(object, "second"),
      await sendMessage(object, "third"),
      await sendMessage(object, "fourth"),
      await sendMessage(object, "fifth"),
    ];

    expect(readSearchIds([{ object, roomId }], "", 2)).toStrictEqual(
      messages.toReversed().map(({ id }) => ({ id, roomId })),
    );
  });

  test("a search with text reads to its end across page boundaries as one read does, and counts its matches on the first page", async () => {
    expect.hasAssertions();

    const { object } = createRoomObject();
    await sendMessage(object, "tie tie tie");
    await sendMessage(object, "tie");
    await sendMessage(object, "tie tie");
    await sendMessage(object, "tie tie tie tie");
    await sendMessage(object, "other");

    const whole = readSearchIds([{ object, roomId }], "tie", 10);
    expect(whole).toHaveLength(4);
    expect(readSearchIds([{ object, roomId }], "tie", 1)).toStrictEqual(whole);
    expect(object.searchMessages({ ...searchAll, limit: 1, query: "tie" }).count).toBe(4);
  });

  test("a search with text across two rooms reads every match to its end, rooms tied on rank taking the room id's order", async () => {
    expect.hasAssertions();

    const { object } = createRoomObject();
    const otherRoomId = v7();
    const otherObject = new RoomObject(
      createMockObjectState(otherRoomId).ctx as unknown as DurableObjectState,
      environment,
    );
    await sendMessage(object, "tie");
    await sendMessage(otherObject, "tie", otherActor);

    // Each room ranks its one match first, so the two tie on rank, and the room id orders them
    const matches = readSearchIds(
      [
        { object, roomId },
        { object: otherObject, roomId: otherRoomId },
      ],
      "tie",
      1,
    );
    expect(matches.map(({ roomId: matchRoomId }) => matchRoomId)).toStrictEqual([roomId, otherRoomId].toSorted());
  });

  test("deleting the room closes its sockets and clears its alarm", async () => {
    expect.hasAssertions();

    const { object, state } = createRoomObject();
    const socket = createSocket();
    state.ctx.acceptWebSocket(socket, [`user:${userId}`, `device:${deviceId}`]);
    await sendMessage(object, "hello");

    await object.deleteAll(actor);

    expect(socket.close).toHaveBeenCalledExactlyOnceWith(1000, "Room deleted");
    await expect(state.ctx.storage.getAlarm()).resolves.toBeNull();
  });

  test("deleting the room takes its sent messages out of each sender's index", async () => {
    expect.hasAssertions();

    const { object } = createRoomObject();
    await sendMessage(object, "hello");
    await sendMessage(object, "reply", otherActor);

    await object.deleteAll(actor);

    expect(getUserStub(userId).removeSentMessagesInRoom).toHaveBeenCalledExactlyOnceWith(roomId);
    expect(getUserStub(otherUserId).removeSentMessagesInRoom).toHaveBeenCalledExactlyOnceWith(roomId);
  });

  test("a message sent live is indexed in its sender's user object as sent, with its room and its time", async () => {
    expect.hasAssertions();

    const { object } = createRoomObject();
    const message = await sendMessage(object, "hello");

    expect(getUserStub(userId).addSentMessage).toHaveBeenCalledExactlyOnceWith({
      createdAt: message.createdAt,
      messageId: message.id,
      roomId,
    });
  });

  test("a sent message its sender's index refuses is written again from the alarm, once its retry is due", async () => {
    expect.hasAssertions();

    const { object, state } = createRoomObject();
    // The index refuses the first write and the first retry, so the second retry is the one it takes
    getUserStub(userId)
      .addSentMessage.mockRejectedValueOnce(new Error("The index is unreachable"))
      .mockRejectedValueOnce(new Error("The index is unreachable"));
    const message = await sendMessage(object, "hello");

    vi.setSystemTime(Temporal.Instant.fromEpochMilliseconds(ROOM_ACTIVITY_DELAY_MS));
    await object.alarm();
    expect(getUserStub(userId).addSentMessage).toHaveBeenCalledTimes(1);
    await expect(state.ctx.storage.getAlarm()).resolves.toBe(WRITE_RETRY_DELAY_MS);

    vi.setSystemTime(Temporal.Instant.fromEpochMilliseconds(WRITE_RETRY_DELAY_MS));
    await object.alarm();
    expect(getUserStub(userId).addSentMessage).toHaveBeenCalledTimes(2);
    await expect(state.ctx.storage.getAlarm()).resolves.toBe(WRITE_RETRY_DELAY_MS * 2);

    vi.setSystemTime(Temporal.Instant.fromEpochMilliseconds(WRITE_RETRY_DELAY_MS * 2));
    await object.alarm();
    expect(getUserStub(userId).addSentMessage).toHaveBeenCalledTimes(3);
    expect(getUserStub(userId).addSentMessage).toHaveBeenLastCalledWith({
      createdAt: message.createdAt,
      messageId: message.id,
      roomId,
    });
    await expect(state.ctx.storage.getAlarm()).resolves.toBeNull();
  });

  test("a scheduled message is indexed in its sender's user object as scheduled, with its room, id and due time", async () => {
    expect.hasAssertions();

    const { object } = createRoomObject();
    const scheduledMessage = await object.createScheduledMessage(
      { id: v7(), message: "later", runAt: new Date(ROOM_ACTIVITY_DELAY_MS) },
      actor,
    );

    expect(getUserStub(userId).addScheduledMessage).toHaveBeenCalledExactlyOnceWith({
      roomId,
      runAt: scheduledMessage.runAt,
      scheduledId: scheduledMessage.id,
    });
  });

  test("deleting the room takes each pending scheduled message out of its sender's index", async () => {
    expect.hasAssertions();

    const { object } = createRoomObject();
    const scheduledMessage = await object.createScheduledMessage(
      { id: v7(), message: "pending", runAt: new Date(ROOM_ACTIVITY_DELAY_MS) },
      actor,
    );

    await object.deleteAll(actor);

    expect(getUserStub(userId).removeScheduledMessage).toHaveBeenCalledExactlyOnceWith(scheduledMessage.id);
  });

  test("deleting the room is kept, and asked again, while a sender's index refuses its removal", async () => {
    expect.hasAssertions();

    const { object } = createRoomObject();
    await sendMessage(object, "hello");
    getUserStub(userId).removeSentMessagesInRoom.mockRejectedValueOnce(new Error("The index is unreachable"));

    await expect(object.deleteAll(actor)).rejects.toThrowErrorMatchingInlineSnapshot(
      `[AggregateError: The room is kept, since 1 sender index removal(s) failed]`,
    );
    expect(object.readMessages(newestPage)).toHaveLength(1);

    await expect(object.deleteAll(actor)).resolves.toBeUndefined();
  });

  test("a refused teardown tells the room's online members nothing, and the accepted one tells each of them once", async () => {
    expect.hasAssertions();

    const { object } = createRoomObject();
    object.attachMember(otherUserId, createStatus(otherUserId, true));
    await sendMessage(object, "hello");
    getUserStub(userId).removeSentMessagesInRoom.mockRejectedValueOnce(new Error("The index is unreachable"));

    await expect(object.deleteAll(actor)).rejects.toThrowErrorMatchingInlineSnapshot(
      `[AggregateError: The room is kept, since 1 sender index removal(s) failed]`,
    );
    expect(getUserStub(otherUserId).broadcastEvent).not.toHaveBeenCalled();

    await object.deleteAll(actor);
    expect(getUserStub(otherUserId).broadcastEvent).toHaveBeenCalledExactlyOnceWith({
      data: { roomId, userId },
      type: "deleteRoom",
    });
  });

  test("a member coming online and going offline is sent to the room as its status, once for each change", () => {
    expect.hasAssertions();

    const { object, state } = createRoomObject();
    const socket = createSocket();
    state.ctx.acceptWebSocket(socket, [`user:${userId}`, `device:${deviceId}`]);
    const connectedStatus = createStatus(otherUserId, true);
    const disconnectedStatus = createStatus(otherUserId, false);

    object.attachMember(otherUserId, connectedStatus);
    object.detachMember(otherUserId, disconnectedStatus);

    expect(readFrames(socket)).toStrictEqual([
      { data: structuredClone(connectedStatus), type: "upsertStatus" },
      { data: structuredClone(disconnectedStatus), type: "upsertStatus" },
    ]);
  });

  test("removing a member closes that member's sockets and no other", () => {
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

  test("closing a session closes the room's sockets of that session and no other", () => {
    expect.hasAssertions();

    const { object, state } = createRoomObject();
    const revokedSessionId = v7();
    const revokedSocket = createSocket();
    const revokedOtherDeviceSocket = createSocket();
    const otherSessionSocket = createSocket();
    state.ctx.acceptWebSocket(revokedSocket, [`user:${userId}`, `session:${revokedSessionId}`, `device:${deviceId}`]);
    state.ctx.acceptWebSocket(revokedOtherDeviceSocket, [
      `user:${userId}`,
      `session:${revokedSessionId}`,
      `device:${otherDeviceId}`,
    ]);
    state.ctx.acceptWebSocket(otherSessionSocket, [`user:${userId}`, `session:${v7()}`, `device:${v7()}`]);

    object.closeSession(revokedSessionId);

    expect(revokedSocket.close).toHaveBeenCalledExactlyOnceWith(1008, "Session revoked");
    expect(revokedOtherDeviceSocket.close).toHaveBeenCalledExactlyOnceWith(1008, "Session revoked");
    expect(otherSessionSocket.close).not.toHaveBeenCalled();
  });
});
