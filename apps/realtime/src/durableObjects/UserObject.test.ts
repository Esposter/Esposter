import type { RoomObject } from "#src/durableObjects/RoomObject";
import type { MockSocket } from "#src/services/durableObject/createMockSocket.test";
import type { ObservedContract } from "#src/services/durableObject/wakeCheck.test";
import type {
  ColumnTopic,
  Page,
  PageCursor,
  PageSort,
  RoomObjectRpc,
  TodoReminder,
  Topic,
  TopicObjectRpc,
  UserClientFrame,
} from "@esposter/db-schema";
import type { Mock } from "vitest";

import { UserObject } from "#src/durableObjects/UserObject";
import { createSocket, readFrames } from "#src/services/durableObject/createMockSocket.test";
import { observeWakes, verifyWakes } from "#src/services/durableObject/wakeCheck.test";
import { createOnlineStatus } from "#src/services/room/createOnlineStatus.test";
import { sendTodoReminder } from "#src/services/todoReminder/sendTodoReminder";
import { toPage } from "@esposter/db";
import { createMockDb, createMockObjectState, MockJobQueueDatabase } from "@esposter/db-mock";
import { createUser } from "@esposter/db-mock/workers";
import {
  AppNotificationType,
  createPageInputSchema,
  getTopicWatchPayload,
  MAX_READ_TOPICS,
  QueueJob,
  roomsInMessage,
  SCHEDULED_MESSAGE_JOB_PAGE_SORT,
  SENT_MESSAGE_PAGE_SORT,
  SOCKET_IDENTITY_HEADER,
  START_PAGE_CURSOR,
  TOMBSTONE_RETENTION_MS,
  TOPIC_WATCH_MAX_AGE_MS,
  usersInAuth,
  UserStatus,
  usersToRoomsInMessage,
} from "@esposter/db-schema";
import { takeOne } from "@esposter/shared";
import { createHmac } from "node:crypto";
import { v7 } from "uuid";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, test, vi } from "vitest";

type RoomStub = Record<"attachMember" | "detachMember", Mock>;

// Each room object as the person's presence reaches it, so a test reads what the person's sockets asked each room to do
const { getRoomStub, roomStubs } = vi.hoisted(() => {
  const roomIdRoomStubMap = new Map<string, RoomStub>();
  const getOrCreateRoomStub = (roomId: string): RoomStub => {
    const existingStub = roomIdRoomStubMap.get(roomId);
    if (existingStub) return existingStub;

    const stub: RoomStub = {
      attachMember: vi.fn<RoomObjectRpc["attachMember"]>(),
      detachMember: vi.fn<RoomObjectRpc["detachMember"]>(),
    };
    roomIdRoomStubMap.set(roomId, stub);
    return stub;
  };
  return { getRoomStub: getOrCreateRoomStub, roomStubs: roomIdRoomStubMap };
});

vi.mock(import("#src/services/room/getRoomObject"), () => ({
  getRoomObject: (roomId: string) => getRoomStub(roomId) as unknown as DurableObjectStub<RoomObject>,
}));

vi.mock(import("#src/services/queue/getJobQueue"), () => import("@esposter/db-mock/workers"));

vi.mock(import("#src/services/todoReminder/sendTodoReminder"), () => ({
  sendTodoReminder: vi.fn<(reminder: TodoReminder) => Promise<void>>(() => Promise.resolve()),
}));

let mockDatabase: Awaited<ReturnType<typeof createMockDb>>;

vi.mock(import("#src/services/shared/db"), () => ({
  get db() {
    return mockDatabase.db;
  },
}));

// A frame a tab sends up its user socket, as the runtime hands it to the object
const sendFrame = (object: ObservedContract<UserObject>, socket: MockSocket, frame: UserClientFrame) =>
  object.webSocketMessage(socket as unknown as WebSocket, JSON.stringify(frame));

// Every item a keyset read answers, read a page at a time, each page from the cursor the one before it answered
const readAll = async <TItem extends Record<TKey, unknown>, TKey extends string>(
  sort: PageSort<TKey>,
  read: (input: { cursor: PageCursor; limit: number }) => Promise<TItem[]>,
  limit: number,
  encodedCursor = "",
): Promise<TItem[]> => {
  const items: TItem[] = [];
  let encodedPageCursor = encodedCursor;
  let page: Page<TItem>;
  do {
    const cursor = createPageInputSchema(sort).parse({ cursor: encodedPageCursor, limit }).cursor;
    // oxlint-disable-next-line no-await-in-loop -- Pagination: the next page's cursor is the one the last page answered
    page = toPage(await read({ cursor, limit: limit + 1 }), sort, cursor, limit);
    items.push(...page.items);
    encodedPageCursor = page.nextCursor;
  } while (page.nextCursor);
  return items;
};

// The sent messages a read answers, each written once and so at version zero
const atVersionZero = <T extends object>(sentMessages: T[]) =>
  sentMessages.map((sentMessage) => ({ ...sentMessage, version: 0 }));

describe(UserObject, () => {
  const userId = v7();
  const firstPage = { cursor: START_PAGE_CURSOR, limit: 10 };
  const sessionId = v7();
  const otherSessionId = v7();
  const deviceId = v7();
  const otherDeviceId = v7();
  // The time a watch's read began, which its subscribe carries to the topic
  const readAt = 0;
  // The secret the Worker is given, and the signature the server makes over a read for the person it was read for
  const topicWatchSecret = "topic-watch-secret";
  const signTopicWatch = (signedUserId: string, watchReadAt: number, topics: ColumnTopic[]) =>
    createHmac("sha256", topicWatchSecret)
      .update(getTopicWatchPayload(signedUserId, watchReadAt, topics))
      .digest("base64url");
  // The frame a tab sends for one read the server signed for the person, named by the time it began and its topics
  const signedWatch = (topics: ColumnTopic[]): UserClientFrame => ({
    data: { readAt, signature: signTopicWatch(userId, readAt, topics), topics },
    type: "watch",
  });
  // Each topic's object as the person's watches reach it, so a test reads what each topic was asked to hold
  const topicStubs = new Map<string, Record<"subscribe" | "unsubscribe", Mock<TopicObjectRpc["subscribe"]>>>();
  const getTopicStub = (topic: string) => {
    const existingStub = topicStubs.get(topic);
    if (existingStub) return existingStub;

    const stub = {
      subscribe: vi.fn<TopicObjectRpc["subscribe"]>(() => Promise.resolve()),
      unsubscribe: vi.fn<TopicObjectRpc["unsubscribe"]>(() => Promise.resolve()),
    };
    topicStubs.set(topic, stub);
    return stub;
  };
  const topicNamespace = { get: (topic: string) => getTopicStub(topic), idFromName: (topic: string) => topic };
  const environment = { TOPIC: topicNamespace } as unknown as Cloudflare.Env;

  const createUserObject = () => {
    const state = createMockObjectState(userId);
    return { object: observeWakes(new UserObject(state.ctx as unknown as DurableObjectState, environment)), state };
  };

  // A tab opens its user socket: the runtime's socket pair, whose server end the object accepts. Returns that end
  const connect = async (object: ObservedContract<UserObject>, tab: { deviceId: string; sessionId: string }) => {
    const socket = createSocket();
    const WebSocketPair = function () {
      return [createSocket(), socket];
    };
    vi.stubGlobal("WebSocketPair", WebSocketPair);
    await object.fetch(
      new Request("http://localhost/ws/user", {
        headers: {
          [SOCKET_IDENTITY_HEADER.deviceId]: tab.deviceId,
          [SOCKET_IDENTITY_HEADER.sessionExpiresAt]: String(Number.MAX_SAFE_INTEGER),
          [SOCKET_IDENTITY_HEADER.sessionId]: tab.sessionId,
          [SOCKET_IDENTITY_HEADER.userId]: userId,
          Upgrade: "websocket",
        },
      }),
    );
    return socket;
  };

  // A room the person is a member of, so the presence write reaches it
  const createRoom = async () => {
    const room = takeOne(await mockDatabase.db.insert(roomsInMessage).values({ name: "name", userId }).returning());
    await mockDatabase.db.insert(usersToRoomsInMessage).values({ roomId: room.id, userId });
    return room;
  };

  // The status a room is told of the person's presence: the row the presence write returns, with the status it detects
  const presenceOf = (isConnected: boolean) => ({
    ...createOnlineStatus(userId),
    isConnected,
    status: isConnected ? UserStatus.Online : UserStatus.Offline,
    // The row is first written online at version zero, and going offline is the one change after it
    version: isConnected ? 0 : 1,
  });

  beforeAll(async () => {
    mockDatabase = await createMockDb();
  });

  beforeEach(async () => {
    vi.useFakeTimers({ now: 0, toFake: ["Date"] });
    vi.stubEnv("TOPIC_WATCH_SECRET", topicWatchSecret);
    // Node's Response refuses the 101 an upgrade is answered with, so the stub keeps only the status the object reads
    vi.stubGlobal(
      "Response",
      class {
        readonly status: number;

        constructor(_body: unknown, init: { status: number }) {
          this.status = init.status;
        }
      },
    );
    await mockDatabase.db.insert(usersInAuth).values(createUser(userId));
  });

  afterEach(async () => {
    verifyWakes();
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
    vi.useRealTimers();
    roomStubs.clear();
    topicStubs.clear();
    MockJobQueueDatabase.clear();
    await mockDatabase.reset();
  });

  afterAll(async () => {
    await mockDatabase.dispose();
  });

  test("the first socket brings the person online in each of their rooms, and the last one to close takes them offline", async () => {
    expect.hasAssertions();

    const { object, state } = createUserObject();
    const firstRoom = await createRoom();
    const secondRoom = await createRoom();
    const firstSocket = await connect(object, { deviceId, sessionId });
    await state.settleWaitUntil();

    expect(getRoomStub(firstRoom.id).attachMember).toHaveBeenCalledExactlyOnceWith(userId, presenceOf(true));
    expect(getRoomStub(secondRoom.id).attachMember).toHaveBeenCalledExactlyOnceWith(userId, presenceOf(true));

    const secondSocket = await connect(object, { deviceId: otherDeviceId, sessionId });
    await state.settleWaitUntil();
    await object.webSocketClose(firstSocket as unknown as WebSocket, 1000, "");
    await state.settleWaitUntil();

    expect(getRoomStub(firstRoom.id).attachMember).toHaveBeenCalledExactlyOnceWith(userId, presenceOf(true));
    expect(getRoomStub(firstRoom.id).detachMember).not.toHaveBeenCalled();

    await object.webSocketClose(secondSocket as unknown as WebSocket, 1000, "");
    await state.settleWaitUntil();

    expect(getRoomStub(firstRoom.id).detachMember).toHaveBeenCalledExactlyOnceWith(userId, presenceOf(false));
    expect(getRoomStub(secondRoom.id).detachMember).toHaveBeenCalledExactlyOnceWith(userId, presenceOf(false));
  });

  test("a dropped connection takes the person offline", async () => {
    expect.hasAssertions();

    const { object, state } = createUserObject();
    const room = await createRoom();
    const socket = await connect(object, { deviceId, sessionId });
    await state.settleWaitUntil();
    // A dropped connection reaches the object as an abnormal close, a code no endpoint may send back
    await object.webSocketClose(socket as unknown as WebSocket, 1006, "");
    await state.settleWaitUntil();

    expect(getRoomStub(room.id).detachMember).toHaveBeenCalledExactlyOnceWith(userId, presenceOf(false));
  });

  test("the reminder alarm sends each due reminder once, and re-arms for the one after", async () => {
    expect.hasAssertions();

    const { object, state } = createUserObject();
    const resourceId = v7();
    // Both are ahead of the pinned clock, since a reminder already due when it is set is retried rather than armed
    const dueAt = new Date(Temporal.Duration.from({ minutes: 1 }).total("milliseconds"));
    const laterDueAt = new Date(dueAt.getTime() + Temporal.Duration.from({ minutes: 1 }).total("milliseconds"));
    const dueItemId = v7();
    const laterItemId = v7();
    await object.reconcileTodoReminders({
      cancelledItemIds: [],
      reminders: [
        { dueAt, itemId: dueItemId, resourceId },
        { dueAt: laterDueAt, itemId: laterItemId, resourceId },
      ],
      resourceId,
    });
    await expect(state.ctx.storage.getAlarm()).resolves.toBe(dueAt.getTime());

    vi.setSystemTime(dueAt);
    await object.alarm();
    await object.alarm();

    expect(sendTodoReminder).toHaveBeenCalledExactlyOnceWith({ dueAt, itemId: dueItemId, resourceId, version: 0 });
    await expect(state.ctx.storage.getAlarm()).resolves.toBe(laterDueAt.getTime());

    vi.setSystemTime(laterDueAt);
    await object.alarm();

    expect(sendTodoReminder).toHaveBeenLastCalledWith({
      dueAt: laterDueAt,
      itemId: laterItemId,
      resourceId,
      version: 0,
    });
    expect(sendTodoReminder).toHaveBeenCalledTimes(2);
    await expect(state.ctx.storage.getAlarm()).resolves.toBeNull();
  });

  // A save that re-dates the item while its reminder is being sent replaces the row, and the alarm's delete must leave
  // The new one armed
  test("the reminder alarm keeps a reminder a save re-dated while it was sending", async () => {
    expect.hasAssertions();

    const { object, state } = createUserObject();
    const resourceId = v7();
    const itemId = v7();
    const dueAt = new Date(Temporal.Duration.from({ minutes: 1 }).total("milliseconds"));
    const reDatedDueAt = new Date(dueAt.getTime() + Temporal.Duration.from({ minutes: 1 }).total("milliseconds"));
    await object.reconcileTodoReminders({
      cancelledItemIds: [],
      reminders: [{ dueAt, itemId, resourceId }],
      resourceId,
    });
    // The save lands while the reminder is sending, so it runs inside the send rather than before it
    vi.mocked(sendTodoReminder).mockImplementationOnce(async () => {
      await object.reconcileTodoReminders({
        cancelledItemIds: [],
        reminders: [{ dueAt: reDatedDueAt, itemId, resourceId }],
        resourceId,
      });
    });

    vi.setSystemTime(dueAt);
    await object.alarm();

    await expect(state.ctx.storage.getAlarm()).resolves.toBe(reDatedDueAt.getTime());
  });

  test("the reminder alarm notifies the person of each due reminder once, and re-arms for the one after", async () => {
    expect.hasAssertions();

    const { object, state } = createUserObject();
    const roomId = v7();
    const dueAt = new Date(Temporal.Duration.from({ minutes: 1 }).total("milliseconds"));
    const laterRunAt = new Date(dueAt.getTime() + Temporal.Duration.from({ minutes: 1 }).total("milliseconds"));
    await object.addReminder({ id: v7(), roomId, runAt: dueAt, text: "due" });
    await object.addReminder({ id: v7(), roomId, runAt: laterRunAt, text: "later" });
    await expect(state.ctx.storage.getAlarm()).resolves.toBe(dueAt.getTime());

    vi.setSystemTime(dueAt);
    await object.alarm();
    await object.alarm();

    expect(MockJobQueueDatabase.get(QueueJob.ProcessNotification)).toStrictEqual([
      { roomId, text: "due", type: AppNotificationType.Reminder, userId },
    ]);
    await expect(object.readReminders(firstPage)).resolves.toHaveLength(1);
    await expect(state.ctx.storage.getAlarm()).resolves.toBe(laterRunAt.getTime());

    vi.setSystemTime(laterRunAt);
    await object.alarm();

    expect(MockJobQueueDatabase.get(QueueJob.ProcessNotification)).toStrictEqual([
      { roomId, text: "due", type: AppNotificationType.Reminder, userId },
      { roomId, text: "later", type: AppNotificationType.Reminder, userId },
    ]);
    // Both sent reminders are tombstones now, so no run is left and the alarm wakes at the oldest tombstone's purge
    await expect(state.ctx.storage.getAlarm()).resolves.toBe(dueAt.getTime() + TOMBSTONE_RETENTION_MS);
  });

  test("a reminder armed again under its id replaces the one it names, so a re-run of the step that armed it converges", async () => {
    expect.hasAssertions();

    const { object } = createUserObject();
    const reminder = {
      id: v7(),
      roomId: v7(),
      runAt: new Date(Temporal.Duration.from({ minutes: 1 }).total("milliseconds")),
      text: "text",
    };
    await object.addReminder(reminder);
    await object.addReminder(reminder);

    await expect(object.readReminders(firstPage)).resolves.toHaveLength(1);
  });

  test("cancelling the reminder that was next due re-arms the alarm for the one after it", async () => {
    expect.hasAssertions();

    const { object, state } = createUserObject();
    const cancelledId = v7();
    const laterRunAt = new Date(Temporal.Duration.from({ minutes: 2 }).total("milliseconds"));
    await object.addReminder({
      id: cancelledId,
      roomId: v7(),
      runAt: new Date(Temporal.Duration.from({ minutes: 1 }).total("milliseconds")),
      text: "cancelled",
    });
    await object.addReminder({ id: v7(), roomId: v7(), runAt: laterRunAt, text: "later" });

    await expect(object.removeReminder(cancelledId)).resolves.toMatchObject({
      deletedAt: new Date(0),
      id: cancelledId,
    });
    await expect(object.removeReminder(cancelledId)).resolves.toBeUndefined();
    await expect(state.ctx.storage.getAlarm()).resolves.toBe(laterRunAt.getTime());
  });

  // A cancel leaves the reminder as a tombstone no read returns and the alarm never sends, and the alarm is then armed
  // For the tombstone's expiry, so the purge runs when it has passed
  test("cancelling a reminder leaves a tombstone the alarm never sends, armed for the tombstone's expiry", async () => {
    expect.hasAssertions();

    const { object, state } = createUserObject();
    const id = v7();
    const roomId = v7();
    const dueAt = new Date(Temporal.Duration.from({ minutes: 1 }).total("milliseconds"));
    await object.addReminder({ id, roomId, runAt: dueAt, text: "cancelled" });

    await expect(object.removeReminder(id)).resolves.toStrictEqual({
      deletedAt: new Date(0),
      id,
      roomId,
      runAt: dueAt,
      text: "",
      version: 1,
    });
    vi.setSystemTime(dueAt);
    await object.alarm();

    expect(MockJobQueueDatabase.get(QueueJob.ProcessNotification) ?? []).toStrictEqual([]);
    await expect(object.readReminders(firstPage)).resolves.toStrictEqual([]);
    await expect(state.ctx.storage.getAlarm()).resolves.toBe(TOMBSTONE_RETENTION_MS);
  });

  // A reminder added again under its id revives its tombstone at a higher version, so a client that holds the tombstone
  // Takes the revival as newer than it
  test("a reminder added again under its id after a cancel revives its tombstone at a higher version", async () => {
    expect.hasAssertions();

    const { object } = createUserObject();
    const reminder = {
      id: v7(),
      roomId: v7(),
      runAt: new Date(Temporal.Duration.from({ minutes: 1 }).total("milliseconds")),
      text: "text",
    };
    await object.addReminder(reminder);
    await object.removeReminder(reminder.id);
    await object.addReminder(reminder);

    await expect(object.readReminders(firstPage)).resolves.toStrictEqual([
      { ...reminder, deletedAt: null, version: 2 },
    ]);
  });

  // The alarm removes a reminder's tombstone once the tombstone retention has passed, so a reminder added under its id
  // After that is a new row at version zero, as the forgotten-tombstone rule on the client already assumes
  test("the alarm purges a reminder's tombstone past the tombstone retention", async () => {
    expect.hasAssertions();

    const { object } = createUserObject();
    const reminder = {
      id: v7(),
      roomId: v7(),
      runAt: new Date(Temporal.Duration.from({ minutes: 1 }).total("milliseconds")),
      text: "text",
    };
    await object.addReminder(reminder);
    await object.removeReminder(reminder.id);

    vi.setSystemTime(Temporal.Instant.fromEpochMilliseconds(TOMBSTONE_RETENTION_MS + 1));
    await object.alarm();
    await object.addReminder(reminder);

    await expect(object.readReminders(firstPage)).resolves.toStrictEqual([
      { ...reminder, deletedAt: null, version: 0 },
    ]);
  });

  // A scheduled message the room sends or cancels leaves its index entry a tombstone, and that cancel or send arms the
  // Alarm for the tombstone's purge, as a reminder's cancel does, even when no reminder is left to wake the alarm
  test("a scheduled message's tombstone arms the alarm for its purge", async () => {
    expect.hasAssertions();

    const { object, state } = createUserObject();
    const scheduledId = v7();
    await object.addScheduledMessage({
      roomId: v7(),
      runAt: new Date(Temporal.Duration.from({ minutes: 1 }).total("milliseconds")),
      scheduledId,
    });
    await object.removeScheduledMessage(scheduledId);

    await expect(state.ctx.storage.getAlarm()).resolves.toBe(TOMBSTONE_RETENTION_MS);
  });

  // A person who leaves a room takes its reminders and scheduled messages with them, so the one due first in it never
  // Fires, while a reminder in another room is still sent when it is due
  test("removing a room's scheduled items drops its reminders and index entries, so none of them fires after the person leaves", async () => {
    expect.hasAssertions();

    const { object, state } = createUserObject();
    const leftRoomId = v7();
    const roomId = v7();
    const dueAt = new Date(Temporal.Duration.from({ minutes: 1 }).total("milliseconds"));
    const laterRunAt = new Date(dueAt.getTime() + Temporal.Duration.from({ minutes: 1 }).total("milliseconds"));
    await object.addReminder({ id: v7(), roomId: leftRoomId, runAt: dueAt, text: "left" });
    await object.addReminder({ id: v7(), roomId, runAt: laterRunAt, text: "kept" });
    await object.addScheduledMessage({ roomId: leftRoomId, runAt: dueAt, scheduledId: v7() });
    await object.addScheduledMessage({ roomId, runAt: laterRunAt, scheduledId: v7() });

    await object.removeRoomScheduledItems(leftRoomId);

    const reminders = await object.readReminders(firstPage);
    const scheduledMessages = await object.readScheduledMessages(firstPage);
    expect(reminders.map(({ text }) => text)).toStrictEqual(["kept"]);
    expect(scheduledMessages.map(({ roomId: messageRoomId }) => messageRoomId)).toStrictEqual([roomId]);
    await expect(state.ctx.storage.getAlarm()).resolves.toBe(laterRunAt.getTime());

    vi.setSystemTime(laterRunAt);
    await object.alarm();

    expect(MockJobQueueDatabase.get(QueueJob.ProcessNotification)).toStrictEqual([
      { roomId, text: "kept", type: AppNotificationType.Reminder, userId },
    ]);
  });

  test("closing a session closes the sockets of that session and no other", async () => {
    expect.hasAssertions();

    const { object } = createUserObject();
    const revokedSocket = await connect(object, { deviceId, sessionId });
    const otherDeviceSocket = await connect(object, { deviceId: otherDeviceId, sessionId });
    const otherSessionSocket = await connect(object, { deviceId: v7(), sessionId: otherSessionId });

    await object.closeSession(sessionId);

    expect(revokedSocket.close).toHaveBeenCalledExactlyOnceWith(1008, "Session revoked");
    expect(otherDeviceSocket.close).toHaveBeenCalledExactlyOnceWith(1008, "Session revoked");
    expect(otherSessionSocket.close).not.toHaveBeenCalled();
  });

  test("a topic is held once however many of the person's tabs watch it, and let go when the last stops", async () => {
    expect.hasAssertions();

    const { object } = createUserObject();
    const topic: Topic = `post:${v7()}`;
    const firstSocket = await connect(object, { deviceId, sessionId });
    const secondSocket = await connect(object, { deviceId: otherDeviceId, sessionId });
    await sendFrame(object, firstSocket, signedWatch([{ topic }]));
    await sendFrame(object, secondSocket, signedWatch([{ topic }]));
    await sendFrame(object, firstSocket, { data: { topics: [topic] }, type: "unwatch" });

    // Each watch subscribes the person again, which the topic holds once, and the topic is let go of only by the last
    // Tab
    expect(getTopicStub(topic).subscribe).toHaveBeenCalledWith(userId, readAt, undefined);
    expect(getTopicStub(topic).unsubscribe).not.toHaveBeenCalled();

    await object.webSocketClose(secondSocket as unknown as WebSocket, 1000, "");

    expect(getTopicStub(topic).unsubscribe).toHaveBeenCalledExactlyOnceWith(userId);
  });

  // A watch names the columns its read references in the topic, and the topic's object is told them, so it can tell
  // Which publishes reach the watch
  test("a watch hands the columns it reads of a topic to the topic's subscribe", async () => {
    expect.hasAssertions();

    const { object } = createUserObject();
    const topic: Topic = `message_usersToRooms:roomId=${v7()}`;
    const socket = await connect(object, { deviceId, sessionId });
    await sendFrame(object, socket, signedWatch([{ columns: ["isHidden"], topic }]));

    expect(getTopicStub(topic).subscribe).toHaveBeenCalledExactlyOnceWith(userId, readAt, ["isHidden"]);
  });

  // A signed read names the topics it was given, so a frame that adds a topic the read did not name is refused whole:
  // The signature covers the topics it was made over and no others, so neither topic is subscribed or held
  test("a watch frame naming a topic its signed read did not name subscribes nothing", async () => {
    expect.hasAssertions();

    const { object } = createUserObject();
    const signedTopic: Topic = `post:${v7()}`;
    const unsignedTopic: Topic = `post:${v7()}`;
    const signature = signTopicWatch(userId, readAt, [{ topic: signedTopic }]);
    const socket = await connect(object, { deviceId, sessionId });
    await sendFrame(object, socket, {
      data: { readAt, signature, topics: [{ topic: signedTopic }, { topic: unsignedTopic }] },
      type: "watch",
    });
    await object.invalidate(signedTopic);
    await object.invalidate(unsignedTopic);

    expect(getTopicStub(signedTopic).subscribe).not.toHaveBeenCalled();
    expect(getTopicStub(unsignedTopic).subscribe).not.toHaveBeenCalled();
    expect(readFrames(socket)).toStrictEqual([]);
  });

  // A signature the server made for another person, or one with its first character changed, covers no watch of this
  // Person
  test("a watch whose signature is tampered is refused, and so is one signed for another person", async () => {
    expect.hasAssertions();

    const { object } = createUserObject();
    const topic: Topic = `post:${v7()}`;
    const topics = [{ topic }];
    const signature = signTopicWatch(userId, readAt, topics);
    const tamperedSignature = `${signature.startsWith("A") ? "B" : "A"}${signature.slice(1)}`;
    const socket = await connect(object, { deviceId, sessionId });
    await sendFrame(object, socket, { data: { readAt, signature: tamperedSignature, topics }, type: "watch" });
    await sendFrame(object, socket, {
      data: { readAt, signature: signTopicWatch(v7(), readAt, topics), topics },
      type: "watch",
    });
    await object.invalidate(topic);

    expect(getTopicStub(topic).subscribe).not.toHaveBeenCalled();
    expect(readFrames(socket)).toStrictEqual([]);
  });

  // A signed watch subscribes each of its topics with the columns its read names, a count's empty list told apart from
  // A topic that names every column
  test("a signed watch subscribes each of its topics with the columns its read names", async () => {
    expect.hasAssertions();

    const { object } = createUserObject();
    const countTopic: Topic = `message_usersToRooms:roomId=${v7()}`;
    const columnTopic: Topic = `message_usersToRooms:userId=${v7()}`;
    const socket = await connect(object, { deviceId, sessionId });
    await sendFrame(
      object,
      socket,
      signedWatch([
        { columns: [], topic: countTopic },
        { columns: ["isHidden"], topic: columnTopic },
      ]),
    );

    expect(getTopicStub(countTopic).subscribe).toHaveBeenCalledExactlyOnceWith(userId, readAt, []);
    expect(getTopicStub(columnTopic).subscribe).toHaveBeenCalledExactlyOnceWith(userId, readAt, ["isHidden"]);
  });

  // A signature holds for an hour after its read began, so a stored one cannot re-open a topic for good: a read past
  // The bound is refused, whatever the signature says
  test("a watch whose read began past the bound is refused", async () => {
    expect.hasAssertions();

    const { object } = createUserObject();
    const topic: Topic = `post:${v7()}`;
    const socket = await connect(object, { deviceId, sessionId });
    vi.setSystemTime(Temporal.Instant.fromEpochMilliseconds(TOPIC_WATCH_MAX_AGE_MS).add({ milliseconds: 1 }));
    await sendFrame(object, socket, signedWatch([{ topic }]));

    expect(getTopicStub(topic).subscribe).not.toHaveBeenCalled();
  });

  // A tab still running the client from before signatures sends its watch with no signature, which the frame refuses
  // Whatever the secret is: the stale tab is dropped unanswered, and a reload picks up a signed watch
  test("a watch with no signature is refused even with the secret set", async () => {
    expect.hasAssertions();

    const { object } = createUserObject();
    const topic: Topic = `post:${v7()}`;
    const socket = await connect(object, { deviceId, sessionId });
    await object.webSocketMessage(
      socket as unknown as WebSocket,
      JSON.stringify({ data: { readAt, topics: [{ topic }] }, type: "watch" }),
    );

    expect(getTopicStub(topic).subscribe).not.toHaveBeenCalled();
  });

  test("an invalidation reaches the tabs watching its topic and no other", async () => {
    expect.hasAssertions();

    const { object } = createUserObject();
    const topic: Topic = `post:${v7()}`;
    const watchingSocket = await connect(object, { deviceId, sessionId });
    const otherSocket = await connect(object, { deviceId: otherDeviceId, sessionId });
    await sendFrame(object, watchingSocket, signedWatch([{ topic }]));
    await object.invalidate(topic);

    expect(readFrames(watchingSocket)).toStrictEqual([{ data: { topic }, type: "invalidate" }]);
    expect(readFrames(otherSocket)).toStrictEqual([]);
  });

  // A subscribe that failed on a watch is retried by the next watch of the topic, from any tab, rather than left
  // Unsubscribed
  test("a watch whose subscribe failed is subscribed again by the next watch of its topic", async () => {
    expect.hasAssertions();

    const { object } = createUserObject();
    const topic: Topic = `post:${v7()}`;
    const firstSocket = await connect(object, { deviceId, sessionId });
    const secondSocket = await connect(object, { deviceId: otherDeviceId, sessionId });
    getTopicStub(topic).subscribe.mockRejectedValueOnce(new Error("subscribe failed"));
    await expect(sendFrame(object, firstSocket, signedWatch([{ topic }]))).rejects.toThrowErrorMatchingInlineSnapshot(
      `[Error: subscribe failed]`,
    );
    await sendFrame(object, secondSocket, signedWatch([{ topic }]));

    expect(getTopicStub(topic).subscribe).toHaveBeenCalledTimes(2);
    expect(getTopicStub(topic).subscribe).toHaveBeenLastCalledWith(userId, readAt, undefined);
  });

  // The account's erase empties every store its object holds, the watches of its tabs and its alarm, so nothing is left
  // For its rooms' indexes to name
  test("erasing the person's object empties its reminders, joined calls, indexes and watches, and clears its alarm", async () => {
    expect.hasAssertions();

    const { object, state } = createUserObject();
    const roomId = v7();
    const topic: Topic = `post:${v7()}`;
    const reminderId = v7();
    const scheduledId = v7();
    const resourceId = v7();
    const dueAt = new Date(Temporal.Duration.from({ minutes: 1 }).total("milliseconds"));
    await object.addReminder({ id: reminderId, roomId, runAt: dueAt, text: "text" });
    await object.addJoinedCall(v7());
    await object.addScheduledMessage({ roomId, runAt: dueAt, scheduledId });
    await object.addSentMessage({ createdAt: new Date(0), messageId: 1, roomId });
    await object.reconcileTodoReminders({
      cancelledItemIds: [],
      reminders: [{ dueAt, itemId: v7(), resourceId }],
      resourceId,
    });
    const socket = await connect(object, { deviceId, sessionId });
    await sendFrame(object, socket, signedWatch([{ topic }]));
    await expect(state.ctx.storage.getAlarm()).resolves.toBe(dueAt.getTime());

    await object.erase();

    await expect(object.countScheduledMessageJobs()).resolves.toBe(0);
    await expect(object.readJoinedCallIds()).resolves.toStrictEqual([]);
    await expect(object.readSentMessages(firstPage)).resolves.toStrictEqual([]);
    await expect(object.readScheduledMessages(firstPage)).resolves.toStrictEqual([]);
    await expect(object.readReminders(firstPage)).resolves.toStrictEqual([]);
    await expect(state.ctx.storage.getAlarm()).resolves.toBeNull();
    expect(getTopicStub(topic).unsubscribe).toHaveBeenCalledExactlyOnceWith(userId);
  });

  test("a tab watching more topics than one read holds keeps every one of its reads' topics, and an invalidation reaches any", async () => {
    expect.hasAssertions();

    const { object } = createUserObject();
    const topics = Array.from({ length: MAX_READ_TOPICS * 2 }, (): Topic => `post:${v7()}`);
    const socket = await connect(object, { deviceId, sessionId });
    await sendFrame(object, socket, signedWatch(topics.slice(0, MAX_READ_TOPICS).map((topic) => ({ topic }))));
    await sendFrame(object, socket, signedWatch(topics.slice(MAX_READ_TOPICS).map((topic) => ({ topic }))));
    const lastTopic = takeOne(topics, topics.length - 1);
    await object.invalidate(lastTopic);

    expect(getTopicStub(lastTopic).subscribe).toHaveBeenCalledExactlyOnceWith(userId, readAt, undefined);
    expect(readFrames(socket)).toStrictEqual([{ data: { topic: lastTopic }, type: "invalidate" }]);
  });

  test("the reminders are read to their end across a page boundary, soonest first, with the times tied", async () => {
    expect.hasAssertions();

    const { object } = createUserObject();
    const roomId = v7();
    // Three reminders share the first time and two the next, so the page boundaries fall inside the ties
    const reminders = [
      ["00000000-0000-7000-8000-000000000001", new Date(0)],
      ["00000000-0000-7000-8000-000000000002", new Date(0)],
      ["00000000-0000-7000-8000-000000000003", new Date(0)],
      ["00000000-0000-7000-8000-000000000004", new Date(1)],
      ["00000000-0000-7000-8000-000000000005", new Date(1)],
    ] as const;
    await Promise.all(reminders.map(async ([id, runAt]) => object.addReminder({ id, roomId, runAt, text: id })));

    const ids = await readAll(SCHEDULED_MESSAGE_JOB_PAGE_SORT, async (input) => object.readReminders(input), 2);

    expect(ids.map(({ id }) => id)).toStrictEqual(reminders.map(([id]) => id));
  });

  test("the scheduled messages are read to their end across a page boundary, soonest first, with the times tied", async () => {
    expect.hasAssertions();

    const { object } = createUserObject();
    const roomId = v7();
    const scheduledMessages = [
      ["00000000-0000-7000-8000-000000000001", new Date(0)],
      ["00000000-0000-7000-8000-000000000002", new Date(0)],
      ["00000000-0000-7000-8000-000000000003", new Date(1)],
      ["00000000-0000-7000-8000-000000000004", new Date(1)],
      ["00000000-0000-7000-8000-000000000005", new Date(1)],
    ] as const;
    await Promise.all(
      scheduledMessages.map(async ([scheduledId, runAt]) => object.addScheduledMessage({ roomId, runAt, scheduledId })),
    );

    const items = await readAll(
      SCHEDULED_MESSAGE_JOB_PAGE_SORT,
      async (input) => object.readScheduledMessages(input),
      2,
    );

    expect(items).toStrictEqual(scheduledMessages.map(([id, runAt]) => ({ id, roomId, runAt })));
  });

  test("the sent messages are read to their end across a page boundary, newest first, with the times and rooms tied", async () => {
    expect.hasAssertions();

    const { object } = createUserObject();
    const firstRoomId = "00000000-0000-7000-8000-000000000001";
    const secondRoomId = "00000000-0000-7000-8000-000000000002";
    const newest = { createdAt: new Date(1), messageId: 3, roomId: firstRoomId };
    const tiedInSecondRoom = [
      { createdAt: new Date(0), messageId: 1, roomId: secondRoomId },
      { createdAt: new Date(0), messageId: 2, roomId: secondRoomId },
    ];
    const tiedInFirstRoom = [
      { createdAt: new Date(0), messageId: 1, roomId: firstRoomId },
      { createdAt: new Date(0), messageId: 2, roomId: firstRoomId },
    ];
    await Promise.all(
      [newest, ...tiedInFirstRoom, ...tiedInSecondRoom].map(async (sentMessage) => object.addSentMessage(sentMessage)),
    );

    const items = await readAll(SENT_MESSAGE_PAGE_SORT, async (input) => object.readSentMessages(input), 2);

    // Newest first, then the later room of a tie before the earlier one, then the later message of a room
    expect(items).toStrictEqual(
      atVersionZero([newest, ...tiedInSecondRoom.toReversed(), ...tiedInFirstRoom.toReversed()]),
    );
  });

  test("a room's sent messages leave the index by their ids, and all of them when the room is deleted, and no other room's", async () => {
    expect.hasAssertions();

    const { object } = createUserObject();
    const firstRoomId = "00000000-0000-7000-8000-000000000001";
    const secondRoomId = "00000000-0000-7000-8000-000000000002";
    const sentMessages = [
      { createdAt: new Date(0), messageId: 1, roomId: firstRoomId },
      { createdAt: new Date(0), messageId: 2, roomId: firstRoomId },
      { createdAt: new Date(0), messageId: 1, roomId: secondRoomId },
    ];
    await Promise.all(sentMessages.map(async (sentMessage) => object.addSentMessage(sentMessage)));

    await object.removeSentMessages({ messageIds: [2], roomId: firstRoomId });
    await expect(object.readSentMessages(firstPage)).resolves.toStrictEqual(
      atVersionZero([takeOne(sentMessages, 2), takeOne(sentMessages, 0)]),
    );

    await object.removeSentMessagesInRoom(firstRoomId);
    await expect(object.readSentMessages(firstPage)).resolves.toStrictEqual(atVersionZero([takeOne(sentMessages, 2)]));
  });
});
