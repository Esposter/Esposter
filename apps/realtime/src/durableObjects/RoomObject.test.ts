import type { ObservedContract } from "#src/services/durableObject/wakeCheck.test";
import type { ObjectInvoker } from "@esposter/db";
import type { ColumnTopic, PageCursor, RoomObjectRpc, RoomReaction, Topic, UserObjectRpc } from "@esposter/db-schema";
import type { Mock } from "vitest";

import { RoomObject } from "#src/durableObjects/RoomObject";
import { createSocket, readFrames } from "#src/services/durableObject/createMockSocket.test";
import { observeWakes, verifyWakes } from "#src/services/durableObject/wakeCheck.test";
import { ROOM_ACTIVITY_DELAY_MS, ROOM_MEMBER_REMOVED_CODE, WRITE_RETRY_DELAY_MS } from "#src/services/room/constants";
import { getWokenTopics, toMergedPage } from "@esposter/db";
import { createMockDb, createMockObjectState, MockJobQueueDatabase } from "@esposter/db-mock";
import { createUser } from "@esposter/db-mock/workers";
import {
  AppNotificationType,
  appUsersInMessage,
  createPageInputSchema,
  getDeviceSocketTag,
  getRoomSearchPageSort,
  getSessionSocketTag,
  getUserSocketTag,
  MessageType,
  QueueJob,
  RoomPermission,
  roomRolesInMessage,
  roomsInMessage,
  SOCKET_IDENTITY_HEADER,
  START_PAGE_CURSOR,
  threadFollowsInMessage,
  TOMBSTONE_RETENTION_MS,
  topicSchema,
  usersInAuth,
  usersToRoomsInMessage,
} from "@esposter/db-schema";
import { takeOne } from "@esposter/shared";
import { and, eq } from "drizzle-orm";
import { v7 } from "uuid";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, test, vi } from "vitest";

vi.mock(import("#src/services/queue/getJobQueue"), () => import("@esposter/db-mock/workers"));

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
  // The row is first written online at version zero, and going offline is the one change after it
  version: isConnected ? 0 : 1,
});

// A search read as the web merges it: each room answers its matches after the cursor, and the merged page keeps `limit`
const readSearchPage = async (
  rooms: { object: ObservedContract<RoomObjectRpc> | RoomObjectRpc; roomId: string }[],
  query: string,
  cursor: PageCursor,
  limit: number,
) =>
  toMergedPage(
    await Promise.all(
      rooms.map(async (room) => {
        const { messages } = await room.object.searchMessages({
          cursor,
          filters: [],
          isCounted: false,
          limit: limit + 1,
          query,
        });
        return messages.map((message) => ({ ...message, roomId: room.roomId }));
      }),
    ),
    getRoomSearchPageSort(query),
    cursor,
    limit,
  );

// Every match of a search, read a page at a time from the cursor each page answered
const readSearchIds = async (
  rooms: { object: ObservedContract<RoomObjectRpc> | RoomObjectRpc; roomId: string }[],
  query: string,
  limit: number,
) => {
  const sort = getRoomSearchPageSort(query);
  const matches: { id: number; roomId: string }[] = [];
  let encodedCursor = "";
  do {
    const cursor = createPageInputSchema(sort).parse({ cursor: encodedCursor, limit }).cursor;
    // The pages are read in turn
    // oxlint-disable-next-line no-await-in-loop -- Pagination: each page answers the cursor the one before it left, so
    const page = await readSearchPage(rooms, query, cursor, limit);
    matches.push(...page.items.map(({ id, roomId: matchRoomId }) => ({ id, roomId: matchRoomId })));
    encodedCursor = page.nextCursor;
  } while (encodedCursor);
  return matches;
};

describe(RoomObject, () => {
  const USER_METHODS = [
    "addScheduledMessage",
    "addSentMessage",
    "broadcastEvent",
    "removeRoomScheduledItems",
    "removeScheduledMessage",
    "removeSentMessages",
    "removeSentMessagesInRoom",
    "roomActivity",
    "updateUserToRoom",
  ] as const;
  type UserMethod = (typeof USER_METHODS)[number];
  const checkIsUserMethod = (method: string): method is UserMethod => USER_METHODS.some((name) => name === method);
  // A person's object as the room reaches it: each method a mock a test reads, and the invoke every call goes through
  type UserStub = { invoke: Mock<ObjectInvoker["invoke"]> } & Record<UserMethod, Mock>;

  let mockDatabase: Awaited<ReturnType<typeof createMockDb>>;
  // Each person's user object as the room reaches it, so a test reads what the room asked each one to do
  const userStubs = new Map<string, UserStub>();
  const getUserStub = (userId: string): UserStub => {
    const existingStub = userStubs.get(userId);
    if (existingStub) return existingStub;

    const methods: Record<UserMethod, Mock> = {
      addScheduledMessage: vi.fn<UserObjectRpc["addScheduledMessage"]>(),
      addSentMessage: vi.fn<UserObjectRpc["addSentMessage"]>(),
      broadcastEvent: vi.fn<UserObjectRpc["broadcastEvent"]>(),
      removeRoomScheduledItems: vi.fn<UserObjectRpc["removeRoomScheduledItems"]>(),
      removeScheduledMessage: vi.fn<UserObjectRpc["removeScheduledMessage"]>(),
      removeSentMessages: vi.fn<UserObjectRpc["removeSentMessages"]>(),
      removeSentMessagesInRoom: vi.fn<UserObjectRpc["removeSentMessagesInRoom"]>(),
      roomActivity: vi.fn<UserObjectRpc["roomActivity"]>(),
      updateUserToRoom: vi.fn<UserObjectRpc["updateUserToRoom"]>(),
    };
    // The person's object answers each RPC through its invoke, so a call reaches the method's mock through it, with no
    // Write Set or read set of its own, since the mocks keep no rows
    const stub: UserStub = {
      ...methods,
      invoke: vi.fn<ObjectInvoker["invoke"]>((method, args) => {
        if (!checkIsUserMethod(method)) throw new Error(`The person's object has no method ${method}`);
        return Promise.resolve({ readSet: [], result: methods[method](...args), writeSet: [] });
      }),
    };
    userStubs.set(userId, stub);
    return stub;
  };
  const userNamespace = { get: getUserStub, idFromName: (userId: string) => userId };
  // Every topic a write published, with the columns it changed, read as the topic objects receive them
  const topicPublishes: ColumnTopic[] = [];
  const topicNamespace = {
    get: (topic: Topic) => ({
      publish: (columns?: string[]) => {
        topicPublishes.push({ columns, topic });
        return Promise.resolve();
      },
    }),
    idFromName: (topic: string) => topicSchema.parse(topic),
  };

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
    return { object: observeWakes(new RoomObject(state.ctx as unknown as DurableObjectState, environment)), state };
  };

  const sendMessage = async (
    object: ObservedContract<RoomObjectRpc> | RoomObjectRpc,
    message: string,
    sender = actor,
  ) => object.createMessage({ message, type: MessageType.Message }, sender);
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
    environment = {
      CORE: mockDatabase.coreDatabase,
      TOPIC: topicNamespace,
      USER: userNamespace,
    } as unknown as Cloudflare.Env;
  });

  afterEach(async () => {
    verifyWakes();
    vi.unstubAllGlobals();
    vi.useRealTimers();
    userStubs.clear();
    topicPublishes.length = 0;
    MockJobQueueDatabase.clear();
    await mockDatabase.reset();
  });

  afterAll(async () => {
    await mockDatabase.dispose();
  });

  // The entry a caller reaches the object through: its method's result, with the read set its reads watch
  test("invoke answers a method's result with the read set its reads watch", async () => {
    expect.hasAssertions();

    const { object } = createRoomObject();
    const message = await sendMessage(object, "a");
    const { readSet, result } = await object.invoke("readMessagesByIds", [[message.id]]);

    expect(result).toStrictEqual([message]);
    expect(readSet).toStrictEqual([{ topic: `room/${roomId}:messages:*` }]);
  });

  // A write's topics are published from the entry, once the write has run. An insert changes which rows the table
  // Holds, so It publishes no columns, and every watch of the topic hears it. Its tables are also published under the
  // Kind, for every room
  test("invoke publishes the topics its insert names, with no columns, since it changes which rows exist", async () => {
    expect.hasAssertions();

    const { object } = createRoomObject();
    await object.invoke("createMessage", [{ message: "a", type: MessageType.Message }, actor]);

    expect(topicPublishes).toStrictEqual([
      { columns: undefined, topic: "room/*:messages:*" },
      { columns: undefined, topic: "room/*:roomState:*" },
      { columns: undefined, topic: `room/${roomId}:messages:*` },
      { columns: undefined, topic: `room/${roomId}:roomState:*` },
    ]);
  });

  // A room's tables are its own, so its topics name its id: a message written in one room reaches no watch of another
  // Room
  test("a message written in one room wakes no watch of another room", async () => {
    expect.hasAssertions();

    const otherRoomId = v7();
    const { object } = createRoomObject();
    const otherRoom = new RoomObject(
      createMockObjectState(otherRoomId).ctx as unknown as DurableObjectState,
      environment,
    );
    const { readSet: otherReadSet } = await otherRoom.invoke("readMessagesByIds", [[1]]);
    const { readSet: ownReadSet } = await object.invoke("readMessagesByIds", [[1]]);
    topicPublishes.length = 0;

    await object.invoke("createMessage", [{ message: "a", type: MessageType.Message }, actor]);

    expect(getWokenTopics(otherReadSet, topicPublishes)).toStrictEqual([]);
    expect(getWokenTopics(ownReadSet, topicPublishes)).toStrictEqual([`room/${roomId}:messages:*`]);
  });

  // A read over many rooms collapses to the room kind's table topic, so a write in a room no read names must still
  // Reach it: every Room's write publishes that topic beside its own
  test("a write in a room no read names wakes a read collapsed to the room kind's table topic", async () => {
    expect.hasAssertions();

    const { object } = createRoomObject();
    topicPublishes.length = 0;

    await object.invoke("createMessage", [{ message: "a", type: MessageType.Message }, actor]);

    expect(getWokenTopics([{ topic: "room/*:messages:*" }], topicPublishes)).toStrictEqual(["room/*:messages:*"]);
  });

  test("a topic that cannot be published leaves the invocation's result standing", async () => {
    expect.hasAssertions();

    const failingNamespace = {
      get: () => ({ publish: () => Promise.reject(new Error("The topic is unavailable")) }),
      idFromName: (topic: string) => topic,
    };
    environment = { ...environment, TOPIC: failingNamespace } as unknown as Cloudflare.Env;
    const { object } = createRoomObject();

    await expect(
      object.invoke("createMessage", [{ message: "a", type: MessageType.Message }, actor]),
    ).resolves.toMatchObject({ result: { message: "a" } });
  });

  test("a write reaches the room's other devices, and not the device that made it", async () => {
    expect.hasAssertions();

    const { object, state } = createRoomObject();
    const senderSocket = createSocket();
    const bystanderSocket = createSocket();
    state.ctx.acceptWebSocket(senderSocket, [getUserSocketTag(userId), getDeviceSocketTag(deviceId)]);
    state.ctx.acceptWebSocket(bystanderSocket, [getUserSocketTag(otherUserId), getDeviceSocketTag(otherDeviceId)]);

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
    await expect(object.readMessages(newestPage)).resolves.toStrictEqual([message]);
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

    expect((await object.readMessages(newestPage))[0]?.appUserImage).toBe("https://example.com/avatar.png");
  });

  test("a webhook message is notified once, however many times its delivery is made", async () => {
    expect.hasAssertions();

    const appUserId = v7();
    await mockDatabase.db.insert(appUsersInMessage).values({ id: appUserId, image: "" });
    const { object } = createRoomObject();
    const input = { appUserId, appUserImage: "", deliveryId: v7(), message: "from a hook", senderName: "hook" };
    const message = await object.createWebhookMessage(input);
    await object.createWebhookMessage(input);

    expect(MockJobQueueDatabase.get(QueueJob.ProcessNotification)).toStrictEqual([
      {
        appUserId,
        message: { id: message.id, message: "from a hook", roomId, userId: null },
        threadRootId: null,
        type: AppNotificationType.Message,
      },
    ]);
  });

  test("a viewer of the room is sent the tombstone of each message an erase removes, and keeps it as deleted", async () => {
    expect.hasAssertions();

    const { object, state } = createRoomObject();
    const viewerSocket = createSocket();
    state.ctx.acceptWebSocket(viewerSocket, [getUserSocketTag(otherUserId), getDeviceSocketTag(otherDeviceId)]);
    const message = await sendMessage(object, "erased soon");

    await object.deleteUserMessages({ limit: 10, userId });

    expect(readFrames(viewerSocket)).toStrictEqual([
      { data: structuredClone([message]), type: "createMessage" },
      {
        data: {
          ...message,
          deletedAt: new Date(0),
          files: [],
          linkPreviewResponse: null,
          message: "",
          updatedAt: new Date(0),
          // The erase is the one change after the message's creation
          version: 1,
        },
        type: "deleteMessage",
      },
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

    await expect(object.searchMessages({ ...searchAll, query: "hello" })).resolves.toStrictEqual({
      count: 1,
      messages: [{ ...message, rank: 1 }],
    });

    await object.updateMessage({ id: message.id, message: "goodbye" }, actor);

    expect((await object.searchMessages({ ...searchAll, query: "hello" })).count).toBe(0);
    expect((await object.searchMessages({ ...searchAll, query: "goodbye" })).count).toBe(1);

    await object.deleteMessage(message.id, actor);

    await expect(object.searchMessages({ ...searchAll, query: "goodbye" })).resolves.toStrictEqual({
      count: 0,
      messages: [],
    });
    // The row is filtered out of a search by its tombstone, so the index itself is read to see that it forgot the words
    expect(
      state.database
        .prepare("select count(*) as count from messages_search where messages_search match ?")
        .get("goodbye")?.count,
    ).toBe(0);
  });

  // The last one to leave leaves the reaction with no reactor at a newer version, so a read that answered before the
  // Removal cannot put the reaction back, and the next reactor continues its count
  test("a reaction gathers its reactors, and the last one to leave leaves it with none at a newer version", async () => {
    expect.hasAssertions();

    const { object } = createRoomObject();
    const message = await sendMessage(object, "hello");
    const emojiTag = v7();
    const reaction = { emojiTag, messageId: message.id };

    await object.addReaction(reaction, actor);
    await object.addReaction(reaction, otherActor);

    await expect(object.readReactions([message.id])).resolves.toStrictEqual([
      { emojiTag, messageId: message.id, userIds: [userId, otherUserId], version: 1 },
    ]);

    await expect(object.removeReaction(reaction, actor)).resolves.toStrictEqual({
      emojiTag,
      messageId: message.id,
      userIds: [otherUserId],
      version: 2,
    });
    await expect(object.removeReaction(reaction, otherActor)).resolves.toStrictEqual({
      emojiTag,
      messageId: message.id,
      userIds: [],
      version: 3,
    });

    await expect(object.readReactions([message.id])).resolves.toStrictEqual([
      { emojiTag, messageId: message.id, userIds: [], version: 3 },
    ]);
    await expect(object.addReaction(reaction, otherActor)).resolves.toStrictEqual({
      emojiTag,
      messageId: message.id,
      userIds: [otherUserId],
      version: 4,
    });
  });

  test("a vote is recorded on the poll's stored body, and withdrawn when no option is named", async () => {
    expect.hasAssertions();

    const { object } = createRoomObject();
    const optionId = v7();
    const otherOptionId = v7();
    // A label is free text, so one shaped like a timestamp is written back as it was typed rather than as a Date
    const label = "1970-01-01T00:00:00Z";
    const poll = await object.createMessage(
      {
        message: JSON.stringify({
          options: [
            { id: optionId, label },
            { id: otherOptionId, label: "a" },
          ],
          question: "question",
          votes: {},
        }),
        type: MessageType.Poll,
      },
      actor,
    );

    expect((await object.votePoll({ id: poll.id, optionId }, otherActor))?.message).toBe(
      JSON.stringify({
        options: [
          { id: optionId, label },
          { id: otherOptionId, label: "a" },
        ],
        question: "question",
        votes: { [otherUserId]: optionId },
      }),
    );

    expect((await object.votePoll({ id: poll.id }, otherActor))?.message).toBe(
      JSON.stringify({
        options: [
          { id: optionId, label },
          { id: otherOptionId, label: "a" },
        ],
        question: "question",
        votes: {},
      }),
    );
  });

  test("a pin and a vote each move the message's updatedAt, so a socket that reconnects finds the change", async () => {
    expect.hasAssertions();

    const { object } = createRoomObject();
    const optionId = v7();
    const otherOptionId = v7();
    const poll = await object.createMessage(
      {
        message: JSON.stringify({
          options: [
            { id: optionId, label: "label" },
            { id: otherOptionId, label: "a" },
          ],
          question: "question",
          votes: {},
        }),
        type: MessageType.Poll,
      },
      actor,
    );

    vi.setSystemTime(Temporal.Instant.fromEpochMilliseconds(ROOM_ACTIVITY_DELAY_MS));
    expect((await object.pinMessage(poll.id, actor))?.updatedAt).toStrictEqual(new Date(ROOM_ACTIVITY_DELAY_MS));

    vi.setSystemTime(Temporal.Instant.fromEpochMilliseconds(ROOM_ACTIVITY_DELAY_MS * 2));
    expect((await object.votePoll({ id: poll.id, optionId }, otherActor))?.updatedAt).toStrictEqual(
      new Date(ROOM_ACTIVITY_DELAY_MS * 2),
    );
  });

  test("an edit sets the message's editedAt to the edit's time, and a message never edited has none", async () => {
    expect.hasAssertions();

    const { object } = createRoomObject();
    const message = await sendMessage(object, "hello");
    expect(message.editedAt).toBeNull();

    vi.setSystemTime(Temporal.Instant.fromEpochMilliseconds(ROOM_ACTIVITY_DELAY_MS));
    const edit = await object.updateMessage({ id: message.id, message: "edited" }, actor);
    expect(edit?.message.editedAt).toStrictEqual(new Date(ROOM_ACTIVITY_DELAY_MS));
    expect(edit?.message.updatedAt).toStrictEqual(new Date(ROOM_ACTIVITY_DELAY_MS));
  });

  test("an edit answers the message it stored beside the message it replaced, so each edit replaces the text the one before it left", async () => {
    expect.hasAssertions();

    const { object } = createRoomObject();
    const message = await sendMessage(object, "hello");

    const firstEdit = await object.updateMessage({ id: message.id, message: "edited" }, actor);
    const secondEdit = await object.updateMessage({ id: message.id, message: "edited again" }, actor);

    expect(firstEdit?.previousMessage.message).toBe("hello");
    expect(secondEdit?.previousMessage.message).toBe("edited");
    expect(secondEdit?.message.message).toBe("edited again");
  });

  test("an edit names the members its new text names, when its caller names none", async () => {
    expect.hasAssertions();

    const { object } = createRoomObject();
    const message = await sendMessage(object, "hello");

    await object.updateMessage({ id: message.id, message: mentioning(otherUserId) }, actor);

    expect((await object.readMessages(newestPage))[0]?.mentions).toStrictEqual([otherUserId]);
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

    await object.updateMessage({ id: message.id, message: mentioning(otherUserId) }, actor);

    expect((await object.readMessages(newestPage))[0]?.mentions).toStrictEqual([]);
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
      (await object.readMessages(newestPage)).map(({ message, userId: sender }) => ({ message, userId: sender })),
    ).toStrictEqual([{ message: "due", userId }]);
    await expect(object.readScheduledMessages({ ids: [later.id], userId })).resolves.toStrictEqual([later]);
    expect(getUserStub(userId).removeScheduledMessage).toHaveBeenCalledExactlyOnceWith(due.id);
    await expect(state.ctx.storage.getAlarm()).resolves.toBe(later.runAt.getTime());
  });

  // The send deletes the due row and writes its message in one transaction. The delete runs on the transaction's own
  // Handle, So it is recorded there, and the scheduled messages it removed wake the reads that watch them
  test("sending a due scheduled message wakes a read of the scheduled messages it removed", async () => {
    expect.hasAssertions();

    const { object } = createRoomObject();
    const due = await object.createScheduledMessage(
      { id: v7(), message: "due", runAt: new Date(ROOM_ACTIVITY_DELAY_MS) },
      actor,
    );
    const { readSet } = await object.invoke("readScheduledMessages", [{ ids: [due.id], userId }]);
    topicPublishes.length = 0;

    vi.setSystemTime(Temporal.Instant.fromEpochMilliseconds(due.runAt.getTime()));
    await object.alarm();

    expect(getWokenTopics(readSet, topicPublishes)).toStrictEqual([`room/${roomId}:scheduledMessages:*`]);
  });

  // A cancel leaves its row as a tombstone that no read returns. A reschedule names a live row, so it cannot bring back
  // A Cancelled one, since a sent message leaves the same tombstone and a revival would send it again. Putting the row
  // Back Under its id, as a failed send does, revives it at a higher version, so a client holding the tombstone takes
  // It as newer
  test("a cancelled scheduled message is a tombstone that a reschedule cannot revive, and putting it back revives it", async () => {
    expect.hasAssertions();

    const { object } = createRoomObject();
    const id = v7();
    const scheduledMessage = await object.createScheduledMessage(
      { id, message: "cancelled", runAt: new Date(ROOM_ACTIVITY_DELAY_MS) },
      actor,
    );

    const tombstone = await object.deleteScheduledMessage(id, actor);

    expect(tombstone).toStrictEqual({ ...scheduledMessage, deletedAt: new Date(0), message: "", version: 1 });
    await expect(object.readScheduledMessages({ ids: [id], userId })).resolves.toStrictEqual([]);
    const runAt = new Date(ROOM_ACTIVITY_DELAY_MS * 2);
    await expect(object.updateScheduledMessage({ id, message: "rescheduled", runAt }, actor)).resolves.toBeNull();

    await expect(object.createScheduledMessage({ id, message: "put back", runAt }, actor)).resolves.toStrictEqual({
      deletedAt: null,
      id,
      message: "put back",
      replyToId: null,
      runAt,
      userId,
      version: 2,
    });
  });

  // The due-send reads only live rows, so a cancelled scheduled message is never sent when it comes due, and its
  // Sender's Index is told of the cancel once, not again by the alarm
  test("the due-send skips a cancelled scheduled message", async () => {
    expect.hasAssertions();

    const { object } = createRoomObject();
    const cancelled = await object.createScheduledMessage(
      { id: v7(), message: "cancelled", runAt: new Date(ROOM_ACTIVITY_DELAY_MS) },
      actor,
    );
    await object.deleteScheduledMessage(cancelled.id, actor);

    vi.setSystemTime(Temporal.Instant.fromEpochMilliseconds(cancelled.runAt.getTime()));
    await object.alarm();

    await expect(object.readMessages(newestPage)).resolves.toStrictEqual([]);
    expect(getUserStub(userId).removeScheduledMessage).toHaveBeenCalledExactlyOnceWith(cancelled.id);
  });

  // The alarm removes a tombstone once the tombstone retention has passed, the age a client forgets its copy at. A
  // Newer Tombstone is kept, so a reschedule of it still revives the row, and the alarm is armed for its expiry
  test("the alarm purges a scheduled message's tombstone past the tombstone retention, and keeps a newer one", async () => {
    expect.hasAssertions();

    const { object, state } = createRoomObject();
    const expired = await object.createScheduledMessage(
      { id: v7(), message: "expired", runAt: new Date(ROOM_ACTIVITY_DELAY_MS * 2) },
      actor,
    );
    const newer = await object.createScheduledMessage(
      { id: v7(), message: "newer", runAt: new Date(ROOM_ACTIVITY_DELAY_MS * 2) },
      actor,
    );
    await object.deleteScheduledMessage(expired.id, actor);
    const newerDeletedAt = Temporal.Duration.from({ days: 1 }).total("milliseconds");
    vi.setSystemTime(Temporal.Instant.fromEpochMilliseconds(newerDeletedAt));
    await object.deleteScheduledMessage(newer.id, actor);

    vi.setSystemTime(Temporal.Instant.fromEpochMilliseconds(TOMBSTONE_RETENTION_MS + 1));
    await object.alarm();
    await expect(state.ctx.storage.getAlarm()).resolves.toBe(newerDeletedAt + TOMBSTONE_RETENTION_MS);

    const runAt = new Date(ROOM_ACTIVITY_DELAY_MS * 3);
    // The expired tombstone was purged, so putting its row back is a new row at version zero
    await expect(object.createScheduledMessage({ id: expired.id, message: "x", runAt }, actor)).resolves.toMatchObject({
      deletedAt: null,
      version: 0,
    });
    // The newer tombstone was kept, so putting its row back revives it at a higher version
    await expect(object.createScheduledMessage({ id: newer.id, message: "x", runAt }, actor)).resolves.toMatchObject({
      deletedAt: null,
      version: 2,
    });
  });

  // A member who leaves takes what they scheduled in the room with them, and their object drops its items for the room,
  // So Nothing of theirs is sent there after they have left. The other members' scheduled messages are left as they
  // Were
  test("a member who leaves the room takes their scheduled messages in it, and another member's stay", async () => {
    expect.hasAssertions();

    const { object } = createRoomObject();
    const scheduledMessage = await object.createScheduledMessage(
      { id: v7(), message: "left", runAt: new Date(ROOM_ACTIVITY_DELAY_MS) },
      actor,
    );
    const otherScheduledMessage = await object.createScheduledMessage(
      { id: v7(), message: "kept", runAt: new Date(ROOM_ACTIVITY_DELAY_MS) },
      otherActor,
    );

    await object.removeMember(userId);

    await expect(object.readScheduledMessages({ ids: [scheduledMessage.id], userId })).resolves.toStrictEqual([]);
    await expect(
      object.readScheduledMessages({ ids: [otherScheduledMessage.id], userId: otherUserId }),
    ).resolves.toStrictEqual([otherScheduledMessage]);
    expect(getUserStub(userId).removeRoomScheduledItems).toHaveBeenCalledExactlyOnceWith(roomId);
    expect(getUserStub(otherUserId).removeRoomScheduledItems).not.toHaveBeenCalled();
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

    expect((await object.readMessages(newestPage))[0]?.mentions).toStrictEqual([otherUserId]);
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

    const { object } = createRoomObject();
    const root = await sendMessage(object, "root", otherActor);
    const reply = await object.createScheduledMessage(
      { id: v7(), message: "reply", replyToId: root.id, runAt: new Date(ROOM_ACTIVITY_DELAY_MS) },
      actor,
    );

    vi.setSystemTime(Temporal.Instant.fromEpochMilliseconds(reply.runAt.getTime()));
    await object.alarm();

    const sentReply = takeOne(await object.readMessages({ cursor: START_PAGE_CURSOR, limit: 1 }));
    expect(MockJobQueueDatabase.get(QueueJob.ProcessNotification)).toStrictEqual([
      {
        appUserId: undefined,
        message: { id: sentReply.id, message: "reply", roomId, userId },
        threadRootId: root.id,
        type: AppNotificationType.Message,
      },
    ]);
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

    await expect(object.readMessages(newestPage)).resolves.toStrictEqual([]);
    await expect(object.readScheduledMessages({ ids: [scheduledMessage.id], userId })).resolves.toStrictEqual([]);
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

    await expect(object.readMessages(newestPage)).resolves.toStrictEqual([]);
    await expect(object.readScheduledMessages({ ids: [scheduledMessage.id], userId })).resolves.toStrictEqual([]);
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

    await expect(object.readMessages(newestPage)).resolves.toStrictEqual([]);
    await expect(
      object.readScheduledMessages({ ids: [scheduledMessage.id], userId: otherUserId }),
    ).resolves.toStrictEqual([]);
  });

  test("the room-activity wave reaches only the members online, once per window, and writes the room's lastMessageAt", async () => {
    expect.hasAssertions();

    const { object, state } = createRoomObject();
    await object.attachMember(userId, createStatus(userId, true));
    await object.attachMember(otherUserId, createStatus(otherUserId, true));
    await sendMessage(object, "first");
    vi.setSystemTime(Temporal.Instant.fromEpochMilliseconds(0).add({ milliseconds: ROOM_ACTIVITY_DELAY_MS / 4 }));
    const last = await sendMessage(object, "second");

    await expect(state.ctx.storage.getAlarm()).resolves.toBe(ROOM_ACTIVITY_DELAY_MS);

    vi.setSystemTime(Temporal.Instant.fromEpochMilliseconds(ROOM_ACTIVITY_DELAY_MS));
    await object.alarm();
    await object.alarm();

    const room = takeOne(await mockDatabase.db.select().from(roomsInMessage).where(eq(roomsInMessage.id, roomId)));
    expect(getUserStub(userId).roomActivity).toHaveBeenCalledExactlyOnceWith(room);
    expect(getUserStub(otherUserId).roomActivity).toHaveBeenCalledExactlyOnceWith(room);
    expect(userStubs.has(offlineUserId)).toBe(false);
    expect(room.lastMessageAt).toStrictEqual(last.createdAt);
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
          // A write that returns its row runs through `raw` or `all`, and one that does not runs through `run`
          if (key === "run" || key === "all" || key === "raw")
            return async () => {
              writeStarted.resolve();
              await writeReleased.promise;
              return Reflect.apply(target[key], target, []);
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
    // The wave and the send are held in flight on purpose, and the check reads each write back before the write
    // Returns, which a Held write cannot allow, so this test's room is not observed
    const object = new RoomObject(createMockObjectState(roomId).ctx as unknown as DurableObjectState, environment);
    object.attachMember(userId, createStatus(userId, true));
    const first = await sendMessage(object, "first");
    vi.setSystemTime(Temporal.Instant.fromEpochMilliseconds(ROOM_ACTIVITY_DELAY_MS));
    const wave = object.alarm();
    await writeStarted.promise;
    const second = await sendMessage(object, "second");
    writeReleased.resolve();
    await wave;
    const firstWaveRoom = takeOne(
      await mockDatabase.db.select().from(roomsInMessage).where(eq(roomsInMessage.id, roomId)),
    );
    vi.setSystemTime(Temporal.Instant.fromEpochMilliseconds(ROOM_ACTIVITY_DELAY_MS * 2));
    await object.alarm();

    const secondWaveRoom = takeOne(
      await mockDatabase.db.select().from(roomsInMessage).where(eq(roomsInMessage.id, roomId)),
    );
    expect(vi.mocked(getUserStub(userId).roomActivity).mock.calls).toStrictEqual([[firstWaveRoom], [secondWaveRoom]]);
    expect(firstWaveRoom.lastMessageAt).toStrictEqual(first.createdAt);
    expect(secondWaveRoom.lastMessageAt).toStrictEqual(second.createdAt);
  });

  test("a room-list event reaches only the members online here, each through its own object", async () => {
    expect.hasAssertions();

    const { object } = createRoomObject();
    await object.attachMember(userId, createStatus(userId, true));
    const leaveEvent = {
      data: { deletedAt: new Date(0), displayName: "", roomId, userId: otherUserId, version: 1 },
      type: "leaveRoom",
    } as const;
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

    await expect(object.readMessages(newestPage)).resolves.toStrictEqual([third, second, first]);
    await expect(
      object.readMessages({ cursor: { isBackward: false, values: [third.id] }, limit: 10 }),
    ).resolves.toStrictEqual([second, first]);
    await expect(
      object.readMessages({ cursor: { isBackward: false, values: [second.id] }, limit: 1 }),
    ).resolves.toStrictEqual([first]);
    await expect(
      object.readMessages({ cursor: { isBackward: true, values: [first.id] }, limit: 10 }),
    ).resolves.toStrictEqual([second, third]);
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

    await expect(object.readThread(root.id)).resolves.toStrictEqual([root, firstReply, secondReply]);
  });

  test("threads are read back as their live roots with their live replies counted, and a deleted root or a reply is left out", async () => {
    expect.hasAssertions();

    const { object } = createRoomObject();
    const root = await sendMessage(object, "root");
    const unrepliedRoot = await sendMessage(object, "unreplied");
    const deletedRoot = await sendMessage(object, "deleted");
    const reply = await object.createMessage(
      { message: "reply", replyToId: root.id, type: MessageType.Message },
      actor,
    );
    const deletedReply = await object.createMessage(
      { message: "deleted reply", replyToId: root.id, type: MessageType.Message },
      actor,
    );
    await object.deleteMessage(deletedReply.id, actor);
    await object.deleteMessage(deletedRoot.id, actor);

    await expect(object.readThreads([unrepliedRoot.id, deletedRoot.id, reply.id, root.id])).resolves.toStrictEqual([
      { ...unrepliedRoot, replyCount: 0 },
      { ...root, lastReplyAt: reply.createdAt, replyCount: 1 },
    ]);
  });

  test("erasing a person's messages is paged: each page blanks what they said, leaves their index, and continues after its last id", async () => {
    expect.hasAssertions();

    const { object } = createRoomObject();
    const first = await sendMessage(object, "first");
    const second = await sendMessage(object, "second");
    const bystander = await sendMessage(object, "bystander", otherActor);
    const third = await sendMessage(object, "third");

    await expect(object.exportUserMessages({ limit: 1, userId })).resolves.toStrictEqual([first]);
    await expect(object.exportUserMessages({ after: first.id, limit: 1, userId })).resolves.toStrictEqual([second]);

    await expect(object.deleteUserMessages({ limit: 2, userId })).resolves.toStrictEqual([first, second]);
    expect(getUserStub(userId).removeSentMessages).toHaveBeenCalledExactlyOnceWith({
      messageIds: [first.id, second.id],
      roomId,
    });
    // The page that ends the erase is short of its limit
    await expect(object.deleteUserMessages({ after: second.id, limit: 2, userId })).resolves.toStrictEqual([third]);
    expect(getUserStub(userId).removeSentMessages).toHaveBeenLastCalledWith({ messageIds: [third.id], roomId });

    await expect(object.readMessages(newestPage)).resolves.toStrictEqual([bystander]);
    expect((await object.searchMessages({ ...searchAll, query: "first" })).count).toBe(0);
  });

  test("a person's reactions are read and erased a page at a time, in the order of their message and emoji", async () => {
    expect.hasAssertions();

    const { object } = createRoomObject();
    const message = await sendMessage(object, "hello");
    const otherMessage = await sendMessage(object, "again");
    await object.addReaction({ emojiTag: "a", messageId: message.id }, actor);
    await object.addReaction({ emojiTag: "b", messageId: message.id }, actor);
    // Another reactor on the first emoji keeps its reaction when the person leaves it
    await object.addReaction({ emojiTag: "a", messageId: message.id }, otherActor);
    await object.addReaction({ emojiTag: "a", messageId: otherMessage.id }, actor);

    expect(
      (await object.exportUserReactions({ limit: 2, userId })).map((reaction) => toReactionKey(reaction)),
    ).toStrictEqual([
      { emojiTag: "a", messageId: message.id },
      { emojiTag: "b", messageId: message.id },
    ]);
    expect(
      (await object.deleteUserReactions({ limit: 2, userId })).map((reaction) => toReactionKey(reaction)),
    ).toStrictEqual([
      { emojiTag: "a", messageId: message.id },
      { emojiTag: "b", messageId: message.id },
    ]);
    expect(
      (await object.deleteUserReactions({ after: { emojiTag: "b", messageId: message.id }, limit: 2, userId })).map(
        (reaction) => toReactionKey(reaction),
      ),
    ).toStrictEqual([{ emojiTag: "a", messageId: otherMessage.id }]);
    // The reactions the person was the last reactor of are left with none, at the version the erase raised
    await expect(object.readReactions([message.id, otherMessage.id])).resolves.toStrictEqual([
      { emojiTag: "a", messageId: message.id, userIds: [otherUserId], version: 2 },
      { emojiTag: "b", messageId: message.id, userIds: [], version: 1 },
      { emojiTag: "a", messageId: otherMessage.id, userIds: [], version: 1 },
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

    await expect(readSearchIds([{ object, roomId }], "", 2)).resolves.toStrictEqual(
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

    const whole = await readSearchIds([{ object, roomId }], "tie", 10);
    expect(whole).toHaveLength(4);
    await expect(readSearchIds([{ object, roomId }], "tie", 1)).resolves.toStrictEqual(whole);
    expect((await object.searchMessages({ ...searchAll, limit: 1, query: "tie" })).count).toBe(4);
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
    const matches = await readSearchIds(
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
    state.ctx.acceptWebSocket(socket, [getUserSocketTag(userId), getDeviceSocketTag(deviceId)]);
    await sendMessage(object, "hello");

    await object.deleteAll([userId, otherUserId]);

    expect(socket.close).toHaveBeenCalledExactlyOnceWith(1000, "Room deleted");
    await expect(state.ctx.storage.getAlarm()).resolves.toBeNull();
  });

  test("deleting the room drops its items from each member's object, the reminders in it included", async () => {
    expect.hasAssertions();

    const { object } = createRoomObject();

    await object.deleteAll([userId, otherUserId]);

    expect(getUserStub(userId).removeRoomScheduledItems).toHaveBeenCalledExactlyOnceWith(roomId);
    expect(getUserStub(otherUserId).removeRoomScheduledItems).toHaveBeenCalledExactlyOnceWith(roomId);
  });

  test("deleting the room takes its sent messages out of each sender's index", async () => {
    expect.hasAssertions();

    const { object } = createRoomObject();
    await sendMessage(object, "hello");
    await sendMessage(object, "reply", otherActor);

    await object.deleteAll([userId, otherUserId]);

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

  // The sender of a pending message is a member, so the room's removal from the member's index takes the message out
  // With the reminders
  test("deleting the room takes each pending scheduled message out of its sender's index", async () => {
    expect.hasAssertions();

    const { object } = createRoomObject();
    await object.createScheduledMessage(
      { id: v7(), message: "pending", runAt: new Date(ROOM_ACTIVITY_DELAY_MS) },
      actor,
    );

    await object.deleteAll([userId, otherUserId]);

    expect(getUserStub(userId).removeRoomScheduledItems).toHaveBeenCalledExactlyOnceWith(roomId);
  });

  test("deleting the room is kept, and asked again, while a sender's index refuses its removal", async () => {
    expect.hasAssertions();

    const { object } = createRoomObject();
    await sendMessage(object, "hello");
    getUserStub(userId).removeSentMessagesInRoom.mockRejectedValueOnce(new Error("The index is unreachable"));

    await expect(object.deleteAll([userId, otherUserId])).rejects.toThrowErrorMatchingInlineSnapshot(
      `[AggregateError: The room is kept, since 1 index or person removal(s) failed]`,
    );
    await expect(object.readMessages(newestPage)).resolves.toHaveLength(1);

    await expect(object.deleteAll([userId, otherUserId])).resolves.toBeUndefined();
  });

  test("a refused teardown keeps the room, and the teardown announces nothing to the members", async () => {
    expect.hasAssertions();

    const { object } = createRoomObject();
    await object.attachMember(otherUserId, createStatus(otherUserId, true));
    await sendMessage(object, "hello");
    getUserStub(userId).removeSentMessagesInRoom.mockRejectedValueOnce(new Error("The index is unreachable"));

    await expect(object.deleteAll([userId, otherUserId])).rejects.toThrowErrorMatchingInlineSnapshot(
      `[AggregateError: The room is kept, since 1 index or person removal(s) failed]`,
    );
    expect(getUserStub(otherUserId).broadcastEvent).not.toHaveBeenCalled();

    await object.deleteAll([userId, otherUserId]);
    expect(getUserStub(otherUserId).broadcastEvent).not.toHaveBeenCalled();
  });

  test("a member coming online and going offline is sent to the room as its status, once for each change", async () => {
    expect.hasAssertions();

    const { object, state } = createRoomObject();
    const socket = createSocket();
    state.ctx.acceptWebSocket(socket, [getUserSocketTag(userId), getDeviceSocketTag(deviceId)]);
    const connectedStatus = createStatus(otherUserId, true);
    const disconnectedStatus = createStatus(otherUserId, false);

    await object.attachMember(otherUserId, connectedStatus);
    await object.detachMember(otherUserId, disconnectedStatus);

    expect(readFrames(socket)).toStrictEqual([
      { data: structuredClone(connectedStatus), type: "upsertStatus" },
      { data: structuredClone(disconnectedStatus), type: "upsertStatus" },
    ]);
  });

  test("removing a member closes that member's sockets and no other", async () => {
    expect.hasAssertions();

    const { object, state } = createRoomObject();
    const memberSocket = createSocket();
    const bystanderSocket = createSocket();
    state.ctx.acceptWebSocket(memberSocket, [getUserSocketTag(otherUserId), getDeviceSocketTag(otherDeviceId)]);
    state.ctx.acceptWebSocket(bystanderSocket, [getUserSocketTag(userId), getDeviceSocketTag(deviceId)]);

    await object.removeMember(otherUserId);

    expect(memberSocket.close).toHaveBeenCalledExactlyOnceWith(ROOM_MEMBER_REMOVED_CODE, "Removed from the room");
    expect(bystanderSocket.close).not.toHaveBeenCalled();
  });

  test("closing a session closes the room's sockets of that session and no other", async () => {
    expect.hasAssertions();

    const { object, state } = createRoomObject();
    const revokedSessionId = v7();
    const revokedSocket = createSocket();
    const revokedOtherDeviceSocket = createSocket();
    const otherSessionSocket = createSocket();
    state.ctx.acceptWebSocket(revokedSocket, [
      getUserSocketTag(userId),
      getSessionSocketTag(revokedSessionId),
      getDeviceSocketTag(deviceId),
    ]);
    state.ctx.acceptWebSocket(revokedOtherDeviceSocket, [
      getUserSocketTag(userId),
      getSessionSocketTag(revokedSessionId),
      getDeviceSocketTag(otherDeviceId),
    ]);
    state.ctx.acceptWebSocket(otherSessionSocket, [
      getUserSocketTag(userId),
      getSessionSocketTag(v7()),
      getDeviceSocketTag(v7()),
    ]);

    await object.closeSession(revokedSessionId);

    expect(revokedSocket.close).toHaveBeenCalledExactlyOnceWith(1008, "Session revoked");
    expect(revokedOtherDeviceSocket.close).toHaveBeenCalledExactlyOnceWith(1008, "Session revoked");
    expect(otherSessionSocket.close).not.toHaveBeenCalled();
  });
});
