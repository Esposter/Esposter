import type { RoomObject } from "#src/durableObjects/RoomObject";
import type { MockSocket } from "#src/services/durableObject/createMockObjectState.test";
import type { RoomObjectRpc, TodoReminder, Topic, TopicObjectRpc, UserClientFrame } from "@esposter/db-schema";
import type { Mock } from "vitest";

import { UserObject } from "#src/durableObjects/UserObject";
import {
  createMockObjectState,
  createSocket,
  readFrames,
} from "#src/services/durableObject/createMockObjectState.test";
import { createOnlineStatus } from "#src/services/room/createOnlineStatus.test";
import { createUser } from "#src/services/shared/createUser.test";
import { sendTodoReminder } from "#src/services/todoReminder/sendTodoReminder";
import { createMockDb } from "@esposter/db-mock";
import {
  AppNotificationType,
  roomsInMessage,
  SOCKET_IDENTITY_HEADER,
  usersInAuth,
  UserStatus,
  usersToRoomsInMessage,
} from "@esposter/db-schema";
import { takeOne } from "@esposter/shared";
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
const sendFrame = (object: UserObject, socket: MockSocket, frame: UserClientFrame) =>
  object.webSocketMessage(socket as unknown as WebSocket, JSON.stringify(frame));

describe(UserObject, () => {
  const userId = v7();
  const sessionId = v7();
  const otherSessionId = v7();
  const deviceId = v7();
  const otherDeviceId = v7();
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
  let environment = { TOPIC: topicNamespace } as unknown as Cloudflare.Env;

  const createUserObject = () => {
    const state = createMockObjectState(userId);
    return { object: new UserObject(state.ctx as unknown as DurableObjectState, environment), state };
  };

  // A tab opens its user socket: the runtime's socket pair, whose server end the object accepts. Returns that end
  const connect = async (object: UserObject, tab: { deviceId: string; sessionId: string }) => {
    const socket = createSocket();
    const WebSocketPair = function () {
      return [createSocket(), socket];
    };
    vi.stubGlobal("WebSocketPair", WebSocketPair);
    await object.fetch(
      new Request("http://localhost/ws/user", {
        headers: {
          [SOCKET_IDENTITY_HEADER.deviceId]: tab.deviceId,
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
  });

  beforeAll(async () => {
    mockDatabase = await createMockDb();
  });

  beforeEach(async () => {
    vi.useFakeTimers({ now: 0, toFake: ["Date"] });
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
    vi.unstubAllGlobals();
    vi.useRealTimers();
    roomStubs.clear();
    topicStubs.clear();
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

  test("a save reaches the person's other tabs, the same session's included, and not the tab that made it", async () => {
    expect.hasAssertions();

    const { object } = createUserObject();
    const savingSocket = await connect(object, { deviceId, sessionId });
    const sameSessionSocket = await connect(object, { deviceId: otherDeviceId, sessionId });
    const otherSessionSocket = await connect(object, { deviceId: v7(), sessionId: otherSessionId });
    const save = { apiKeyName: "", contentVersion: 0, id: v7() };

    await object.saveResourceContent(save, deviceId);

    expect(readFrames(savingSocket)).toStrictEqual([]);
    expect(readFrames(sameSessionSocket)).toStrictEqual([{ data: save, type: "saveResourceContent" }]);
    expect(readFrames(otherSessionSocket)).toStrictEqual([{ data: save, type: "saveResourceContent" }]);
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

    expect(sendTodoReminder).toHaveBeenCalledExactlyOnceWith({ dueAt, itemId: dueItemId, resourceId });
    await expect(state.ctx.storage.getAlarm()).resolves.toBe(laterDueAt.getTime());

    vi.setSystemTime(laterDueAt);
    await object.alarm();

    expect(sendTodoReminder).toHaveBeenLastCalledWith({ dueAt: laterDueAt, itemId: laterItemId, resourceId });
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

    const queue = { send: vi.fn<(message: unknown) => Promise<void>>(() => Promise.resolve()) };
    environment = { ...environment, PROCESS_NOTIFICATION_QUEUE: queue } as unknown as Cloudflare.Env;
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

    expect(queue.send).toHaveBeenCalledExactlyOnceWith({
      roomId,
      text: "due",
      type: AppNotificationType.Reminder,
      userId,
    });
    await expect(object.readReminders()).resolves.toHaveLength(1);
    await expect(state.ctx.storage.getAlarm()).resolves.toBe(laterRunAt.getTime());

    vi.setSystemTime(laterRunAt);
    await object.alarm();

    expect(queue.send).toHaveBeenLastCalledWith({ roomId, text: "later", type: AppNotificationType.Reminder, userId });
    expect(queue.send).toHaveBeenCalledTimes(2);
    await expect(state.ctx.storage.getAlarm()).resolves.toBeNull();
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

    await expect(object.readReminders()).resolves.toHaveLength(1);
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

    await expect(object.removeReminder(cancelledId)).resolves.toBe(true);
    await expect(object.removeReminder(cancelledId)).resolves.toBe(false);
    await expect(state.ctx.storage.getAlarm()).resolves.toBe(laterRunAt.getTime());
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
    await sendFrame(object, firstSocket, { data: { topics: [topic] }, type: "watch" });
    await sendFrame(object, secondSocket, { data: { topics: [topic] }, type: "watch" });
    await sendFrame(object, firstSocket, { data: { topics: [topic] }, type: "unwatch" });

    expect(getTopicStub(topic).subscribe).toHaveBeenCalledExactlyOnceWith(userId);
    expect(getTopicStub(topic).unsubscribe).not.toHaveBeenCalled();

    await object.webSocketClose(secondSocket as unknown as WebSocket, 1000, "");

    expect(getTopicStub(topic).unsubscribe).toHaveBeenCalledExactlyOnceWith(userId);
  });

  test("an invalidation reaches the tabs watching its topic and no other", async () => {
    expect.hasAssertions();

    const { object } = createUserObject();
    const topic: Topic = `post:${v7()}`;
    const watchingSocket = await connect(object, { deviceId, sessionId });
    const otherSocket = await connect(object, { deviceId: otherDeviceId, sessionId });
    await sendFrame(object, watchingSocket, { data: { topics: [topic] }, type: "watch" });
    await object.invalidate(topic);

    expect(readFrames(watchingSocket)).toContainEqual({ data: { topic }, type: "invalidate" });
    expect(readFrames(otherSocket)).not.toContainEqual({ data: { topic }, type: "invalidate" });
  });
});
