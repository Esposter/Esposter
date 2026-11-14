import type { RoomObjectRpc, TodoReminder } from "@esposter/db-schema";
import type { Mock } from "vitest";

import { createMockDb } from "@esposter/db-mock";
import { roomsInMessage, SOCKET_IDENTITY_HEADER, usersInAuth, usersToRoomsInMessage } from "@esposter/db-schema";
import { takeOne } from "@esposter/shared";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, test, vi } from "vitest";

import { UserObject } from "#src/durableObjects/UserObject";
import {
  createMockObjectState,
  createSocket,
  readFrames,
} from "#src/services/durableObject/createMockObjectState.test";
import { createUser } from "#src/services/shared/createUser.test";
import { sendTodoReminder } from "#src/services/todoReminder/sendTodoReminder";

type RoomStub = Record<"attachMember" | "detachMember", Mock>;

// Each room object as the person's presence reaches it, so a test reads what the person's sockets asked each room to do
const { getRoomStub, roomStubs } = vi.hoisted(() => {
  const roomStubs = new Map<string, RoomStub>();
  const getRoomStub = (roomId: string): RoomStub => {
    const existingStub = roomStubs.get(roomId);
    if (existingStub) return existingStub;

    const stub: RoomStub = {
      attachMember: vi.fn<RoomObjectRpc["attachMember"]>(),
      detachMember: vi.fn<RoomObjectRpc["detachMember"]>(),
    };
    roomStubs.set(roomId, stub);
    return stub;
  };
  return { getRoomStub, roomStubs };
});

vi.mock(import("#src/services/room/getRoomObject"), () => ({ getRoomObject: getRoomStub }));

vi.mock(import("#src/services/todoReminder/sendTodoReminder"), () => ({
  sendTodoReminder: vi.fn<(reminder: TodoReminder) => Promise<void>>(() => Promise.resolve()),
}));

let mockDatabase: Awaited<ReturnType<typeof createMockDb>>;

vi.mock(import("#src/services/shared/db"), () => ({
  get db() {
    return mockDatabase.db;
  },
}));

describe(UserObject, () => {
  const userId = crypto.randomUUID();
  const sessionId = crypto.randomUUID();
  const otherSessionId = crypto.randomUUID();
  const deviceId = crypto.randomUUID();
  const otherDeviceId = crypto.randomUUID();
  const environment = {} as unknown as Cloudflare.Env;

  const createUserObject = () => {
    const state = createMockObjectState(userId);
    return { object: new UserObject(state.ctx as unknown as DurableObjectState, environment), state };
  };

  // A tab opens its user socket: the runtime's socket pair, whose server end the object accepts. Returns that end
  const connect = async (object: UserObject, tab: { deviceId: string; sessionId: string }) => {
    const socket = createSocket();
    vi.stubGlobal(
      "WebSocketPair",
      class {
        constructor() {
          return [createSocket(), socket];
        }
      },
    );
    await object.fetch(
      new Request("http://localhost/ws/user", {
        headers: {
          Upgrade: "websocket",
          [SOCKET_IDENTITY_HEADER.deviceId]: tab.deviceId,
          [SOCKET_IDENTITY_HEADER.sessionId]: tab.sessionId,
          [SOCKET_IDENTITY_HEADER.userId]: userId,
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

  beforeAll(async () => {
    mockDatabase = await createMockDb();
  });

  afterAll(async () => {
    await mockDatabase.dispose();
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
    await mockDatabase.reset();
  });

  test("the first socket brings the person online in each of their rooms, and the last one to close takes them offline", async () => {
    expect.hasAssertions();

    const { object, state } = createUserObject();
    const firstRoom = await createRoom();
    const secondRoom = await createRoom();
    const firstSocket = await connect(object, { deviceId, sessionId });
    await state.settleWaitUntil();

    expect(getRoomStub(firstRoom.id).attachMember).toHaveBeenCalledExactlyOnceWith(
      userId,
      expect.objectContaining({ isConnected: true, userId }),
    );
    expect(getRoomStub(secondRoom.id).attachMember).toHaveBeenCalledExactlyOnceWith(
      userId,
      expect.objectContaining({ isConnected: true, userId }),
    );

    const secondSocket = await connect(object, { deviceId: otherDeviceId, sessionId });
    await state.settleWaitUntil();
    object.webSocketClose(firstSocket, 1000, "");
    await state.settleWaitUntil();

    expect(getRoomStub(firstRoom.id).attachMember).toHaveBeenCalledExactlyOnceWith(
      userId,
      expect.objectContaining({ isConnected: true, userId }),
    );
    expect(getRoomStub(firstRoom.id).detachMember).not.toHaveBeenCalled();

    object.webSocketClose(secondSocket, 1000, "");
    await state.settleWaitUntil();

    expect(getRoomStub(firstRoom.id).detachMember).toHaveBeenCalledExactlyOnceWith(
      userId,
      expect.objectContaining({ isConnected: false, userId }),
    );
    expect(getRoomStub(secondRoom.id).detachMember).toHaveBeenCalledExactlyOnceWith(
      userId,
      expect.objectContaining({ isConnected: false, userId }),
    );
  });

  test("a save reaches every tab of the person except those of the session that made it", async () => {
    expect.hasAssertions();

    const { object } = createUserObject();
    const savingSocket = await connect(object, { deviceId, sessionId });
    const otherSocket = await connect(object, { deviceId: otherDeviceId, sessionId: otherSessionId });
    const save = { apiKeyName: "", contentVersion: 0, id: crypto.randomUUID() };

    await object.saveResourceContent(save, sessionId);

    expect(readFrames(savingSocket)).toStrictEqual([]);
    expect(readFrames(otherSocket)).toStrictEqual([{ data: save, type: "saveResourceContent" }]);
  });

  test("the reminder alarm sends each due reminder once, and re-arms for the one after", async () => {
    expect.hasAssertions();

    const { object, state } = createUserObject();
    const resourceId = crypto.randomUUID();
    // Both are ahead of the pinned clock, since a reminder already due when it is set is retried rather than armed
    const dueAt = new Date(Temporal.Duration.from({ minutes: 1 }).total("milliseconds"));
    const laterDueAt = new Date(dueAt.getTime() + Temporal.Duration.from({ minutes: 1 }).total("milliseconds"));
    const dueItemId = crypto.randomUUID();
    const laterItemId = crypto.randomUUID();
    await object.reconcileTodoReminders({
      cancelledItemIds: [],
      reminders: [
        { dueAt, itemId: dueItemId },
        { dueAt: laterDueAt, itemId: laterItemId },
      ],
      resourceId,
    });
    expect(await state.ctx.storage.getAlarm()).toBe(dueAt.getTime());

    vi.setSystemTime(dueAt);
    await object.alarm();
    await object.alarm();

    expect(sendTodoReminder).toHaveBeenCalledExactlyOnceWith({ dueAt, itemId: dueItemId, resourceId });
    expect(await state.ctx.storage.getAlarm()).toBe(laterDueAt.getTime());

    vi.setSystemTime(laterDueAt);
    await object.alarm();

    expect(sendTodoReminder).toHaveBeenLastCalledWith({ dueAt: laterDueAt, itemId: laterItemId, resourceId });
    expect(sendTodoReminder).toHaveBeenCalledTimes(2);
    expect(await state.ctx.storage.getAlarm()).toBeNull();
  });

  test("closing a session closes the sockets of that session and no other", async () => {
    expect.hasAssertions();

    const { object } = createUserObject();
    const revokedSocket = await connect(object, { deviceId, sessionId });
    const otherDeviceSocket = await connect(object, { deviceId: otherDeviceId, sessionId });
    const otherSessionSocket = await connect(object, { deviceId: crypto.randomUUID(), sessionId: otherSessionId });

    await object.closeSession(sessionId);

    expect(revokedSocket.close).toHaveBeenCalledExactlyOnceWith(1008, "Session revoked");
    expect(otherDeviceSocket.close).toHaveBeenCalledExactlyOnceWith(1008, "Session revoked");
    expect(otherSessionSocket.close).not.toHaveBeenCalled();
  });
});
