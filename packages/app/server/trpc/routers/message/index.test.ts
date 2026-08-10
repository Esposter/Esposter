// @vitest-environment nuxt
import type { PollMessageContent } from "#shared/models/message/poll/PollMessageContent";
import type { Context } from "@@/server/trpc/context";
import type { TRPCRouter } from "@@/server/trpc/routers";
import type { BlobDeletionEventGridData, MessageEntity } from "@esposter/db-schema";
import type { DecorateRouterRecord, TrackedEnvelope } from "@trpc/server/unstable-core-do-not-import";
import type { MockInstance } from "vitest";

import { MessageOperation } from "#shared/models/message/MessageOperation";
import { SortOrder } from "#shared/models/pagination/sorting/SortOrder";
import { dayjs } from "#shared/services/dayjs";
import { MESSAGE_ROWKEY_SORT_ITEM } from "#shared/services/pagination/constants";
import { serialize } from "#shared/services/pagination/cursor/serialize";
import { useTableClient } from "@@/server/composables/azure/table/useTableClient";
import { readMessages } from "@@/server/services/message/readMessages";
import { getCursorPaginationData } from "@@/server/services/pagination/cursor/getCursorPaginationData";
import { createCallerFactory } from "@@/server/trpc";
import { createMockContext, getMockSession, mockSessionOnce } from "@@/server/trpc/context.test";
import { getFirstEmit } from "@@/server/trpc/routers/getFirstEmit.test";
import { messageRouter } from "@@/server/trpc/routers/message";
import { roomRouter } from "@@/server/trpc/routers/room";
import { withAsyncIterator } from "@@/server/trpc/routers/withAsyncIterator.test";
import { getBlobName, getThumbnailBlobName } from "@esposter/db";
import {
  AzureContainer,
  AzureEntityType,
  AzureTable,
  getReverseTickedTimestamp,
  MessageType,
  roomFiltersInMessage,
  roomsInMessage,
  SearchIndex,
  StandardMessageEntity,
  usersToRoomsInMessage,
  WordFilterAction,
  WRITE_SAS_DURATION_MS,
} from "@esposter/db-schema";
import {
  InvalidOperationError,
  jsonDateParse,
  MENTION_ID_ATTRIBUTE,
  MENTION_TYPE,
  MENTION_TYPE_ATTRIBUTE,
  NotFoundError,
  Operation,
  takeOne,
} from "@esposter/shared";
import {
  MockContainerDatabase,
  MockEventGridDatabase,
  MockSearchDatabase,
  MockTableClient,
  MockTableDatabase,
} from "azure-mock";
import { and, eq } from "drizzle-orm";
import { afterEach, assert, beforeAll, beforeEach, describe, expect, test, vi } from "vitest";

const { readMessagesMock } = vi.hoisted(() => ({ readMessagesMock: vi.fn<typeof readMessages>() }));

vi.mock(import("@@/server/services/message/readMessages"), async (importOriginal) => {
  const original = await importOriginal();
  readMessagesMock.mockImplementation(original.readMessages);
  return { readMessages: readMessagesMock };
});

const getMessage = (userId: string) =>
  `<span ${MENTION_TYPE_ATTRIBUTE}="${MENTION_TYPE}" ${MENTION_ID_ATTRIBUTE}="${userId}"></span>`;

describe("message", () => {
  let mockContext: Context;
  let messageCaller: DecorateRouterRecord<TRPCRouter["message"]>;
  let roomCaller: DecorateRouterRecord<TRPCRouter["room"]>;
  const filename = "filename";
  const mimetype = "image/jpeg";
  const size = 1000;
  const name = "name";
  const updatedMessage = "updatedMessage";
  // A word the message wrapper cannot contain on its own, so a room's filter only ever matches the text a test
  // Deliberately put in front of it
  const filteredWord = "spam";
  const filteredMessage = `<p>${filteredWord}</p>`;
  const pollOptionId = crypto.randomUUID();
  const pollMessage = JSON.stringify({
    options: [
      { id: pollOptionId, label: "Option A" },
      { id: crypto.randomUUID(), label: "Option B" },
    ],
    question: "Test question",
    votes: {},
  });
  // Every mock Azure client resolves in the same microtask drain, so two concurrent procedures run to completion
  // One after the other and never interleave on their own. The write is the seam the conditional-write tests
  // Need, so it carries a hook they set and every other test leaves as a passthrough
  const { updateEntity } = MockTableClient.prototype;
  let beforeUpdateEntity: (tableClient: MockTableClient) => Promise<unknown>;
  let consoleErrorSpy: MockInstance<typeof console.error>;
  let updateEntitySpy: MockInstance<MockTableClient["updateEntity"]>;
  // Holds the first conditional write open until the second has landed — the interleaving a real deployment
  // Produces on its own
  const holdFirstWrite = () => {
    const { promise: isSecondWritten, resolve: resolveSecondWritten } = Promise.withResolvers<string>();
    const { promise: isFirstWriting, resolve: resolveFirstWriting } = Promise.withResolvers<string>();
    let isFirstWrite = true;
    beforeUpdateEntity = async () => {
      if (!isFirstWrite) return;
      isFirstWrite = false;
      resolveFirstWriting("");
      await isSecondWritten;
    };
    return { isFirstWriting, resolveSecondWritten };
  };

  beforeAll(async () => {
    mockContext = await createMockContext();
    messageCaller = createCallerFactory(messageRouter)(mockContext);
    roomCaller = createCallerFactory(roomRouter)(mockContext);
  });

  beforeEach(() => {
    beforeUpdateEntity = () => Promise.resolve();
    // Calls through, so a genuine failure still prints while a test can count what the router logged
    consoleErrorSpy = vi.spyOn(console, "error");
    updateEntitySpy = vi.spyOn(MockTableClient.prototype, "updateEntity").mockImplementation(async function (
      this: MockTableClient,
      ...args: Parameters<MockTableClient["updateEntity"]>
    ) {
      await beforeUpdateEntity(this);
      return updateEntity.apply(this, args);
    });
  });

  afterEach(async () => {
    consoleErrorSpy.mockRestore();
    updateEntitySpy.mockRestore();
    vi.useRealTimers();
    MockContainerDatabase.clear();
    MockEventGridDatabase.clear();
    MockSearchDatabase.clear();
    MockTableDatabase.clear();
    await mockContext.db.delete(roomsInMessage);
  });

  test("reads empty", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const readMessages = await messageCaller.readMessages({ roomId: newRoom.id });

    expect(readMessages).toStrictEqual(getCursorPaginationData([], 0, []));
  });

  test("reads", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const userId = getMockSession().user.id;
    const message = getMessage(userId);
    const newMessage = await messageCaller.createMessage({ message, roomId: newRoom.id });
    const readMessages = await messageCaller.readMessages({ roomId: newRoom.id });

    expect(readMessages.items).toHaveLength(1);
    expect(takeOne(readMessages.items).message).toBe(newMessage.message);
  });

  test("reads my sent messages", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const userId = getMockSession().user.id;
    const message = getMessage(userId);
    const firstMessage = new StandardMessageEntity({
      createdAt: new Date("1970-01-02"),
      message,
      partitionKey: newRoom.id,
      rowKey: crypto.randomUUID(),
      type: MessageType.Message,
      updatedAt: new Date("1970-01-02"),
      userId,
    });
    const secondMessage = new StandardMessageEntity({
      createdAt: new Date("1970-01-01"),
      message,
      partitionKey: newRoom.id,
      rowKey: crypto.randomUUID(),
      type: MessageType.Message,
      updatedAt: new Date("1970-01-01"),
      userId,
    });
    const otherUserMessage = new StandardMessageEntity({
      createdAt: new Date("1970-01-03"),
      message,
      partitionKey: newRoom.id,
      rowKey: crypto.randomUUID(),
      type: MessageType.Message,
      updatedAt: new Date("1970-01-03"),
      userId: crypto.randomUUID(),
    });
    const deletedMessage = new StandardMessageEntity({
      createdAt: new Date("1970-01-03"),
      deletedAt: new Date("1970-01-03"),
      message,
      partitionKey: newRoom.id,
      rowKey: crypto.randomUUID(),
      type: MessageType.Message,
      updatedAt: new Date("1970-01-03"),
      userId,
    });
    MockSearchDatabase.set(SearchIndex.Messages, [firstMessage, secondMessage, otherUserMessage, deletedMessage]);
    const sentMessages = await messageCaller.readMySentMessages({ limit: 1 });

    expect(sentMessages.count).toBe(2);
    expect(sentMessages.data.hasMore).toBe(true);
    expect(sentMessages.data.items).toHaveLength(1);
    expect(takeOne(sentMessages.data.items).message.rowKey).toBe(firstMessage.rowKey);
    expect(takeOne(sentMessages.data.items).room.id).toBe(newRoom.id);
  });

  test("reads with cursor and includes value", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const userId = getMockSession().user.id;
    const message = getMessage(userId);
    const firstMessage = await messageCaller.createMessage({ message, roomId: newRoom.id });
    const secondMessage = await messageCaller.createMessage({ message, roomId: newRoom.id });
    const cursor = serialize({ rowKey: secondMessage.rowKey }, [MESSAGE_ROWKEY_SORT_ITEM]);
    let readMessages = await messageCaller.readMessages({ cursor, roomId: newRoom.id });

    expect(readMessages.items).toHaveLength(1);
    expect(takeOne(readMessages.items).rowKey).toBe(firstMessage.rowKey);

    readMessages = await messageCaller.readMessages({
      cursor,
      isIncludeValue: true,
      roomId: newRoom.id,
    });

    expect(readMessages.items).toHaveLength(2);
    // Default read is newest-first (reverse-ticked rowKey), so the included cursor value leads
    expect(takeOne(readMessages.items).rowKey).toBe(secondMessage.rowKey);
    expect(takeOne(readMessages.items, 1).rowKey).toBe(firstMessage.rowKey);
  });

  test("reads in ascending order with cursor and includes value", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const userId = getMockSession().user.id;
    const message = getMessage(userId);
    const firstMessage = await messageCaller.createMessage({ message, roomId: newRoom.id });
    const secondMessage = await messageCaller.createMessage({ message, roomId: newRoom.id });
    // Limit 1 should return oldest first
    let readMessages = await messageCaller.readMessages({ limit: 1, order: SortOrder.Asc, roomId: newRoom.id });

    expect(readMessages.items).toHaveLength(1);
    expect(takeOne(readMessages.items).rowKey).toBe(firstMessage.rowKey);

    const cursor = serialize({ rowKey: getReverseTickedTimestamp(firstMessage.rowKey) }, [MESSAGE_ROWKEY_SORT_ITEM]);
    readMessages = await messageCaller.readMessages({
      cursor,
      order: SortOrder.Asc,
      roomId: newRoom.id,
    });

    expect(readMessages.items).toHaveLength(1);
    expect(takeOne(readMessages.items).rowKey).toBe(secondMessage.rowKey);

    readMessages = await messageCaller.readMessages({
      cursor,
      isIncludeValue: true,
      order: SortOrder.Asc,
      roomId: newRoom.id,
    });

    expect(readMessages.items).toHaveLength(2);
    expect(takeOne(readMessages.items).rowKey).toBe(firstMessage.rowKey);
    expect(takeOne(readMessages.items, 1).rowKey).toBe(secondMessage.rowKey);
  });

  // The index row lands before the entity, so an ascending page can see a message the join cannot serve. The page
  // Skips it AND advances the cursor: every caller re-issues on the returned cursor while `hasMore` is set, so
  // Echoing the incoming one is a hot loop rather than a wait
  test("advances an ascending page past an index row whose message entity is missing", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const message = getMessage(getMockSession().user.id);
    const firstMessage = await messageCaller.createMessage({ message, roomId: newRoom.id });
    const secondMessage = await messageCaller.createMessage({ message, roomId: newRoom.id });
    // The state between createMessage's two table writes
    const messageClient = await useTableClient(AzureTable.Messages);
    await messageClient.deleteEntity(newRoom.id, firstMessage.rowKey);
    const readMessages = await messageCaller.readMessages({ limit: 1, order: SortOrder.Asc, roomId: newRoom.id });

    expect(readMessages.items).toStrictEqual([]);
    expect(readMessages.hasMore).toBe(true);
    expect(readMessages.nextCursor).not.toBe("");

    const nextReadMessages = await messageCaller.readMessages({
      cursor: readMessages.nextCursor,
      order: SortOrder.Asc,
      roomId: newRoom.id,
    });

    expect(takeOne(nextReadMessages.items).rowKey).toBe(secondMessage.rowKey);
  });

  // A soft delete leaves the index row and stamps `deletedAt`, which the join filters — the same shape an in-flight
  // Write makes. Reading it as one freezes the room's ascending scroll on the deleted message
  test("serves the messages after one deleted moments earlier", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const message = getMessage(getMockSession().user.id);
    const firstMessage = await messageCaller.createMessage({ message, roomId: newRoom.id });
    const secondMessage = await messageCaller.createMessage({ message, roomId: newRoom.id });
    await messageCaller.deleteMessage({ partitionKey: newRoom.id, rowKey: firstMessage.rowKey });
    const readMessages = await messageCaller.readMessages({ order: SortOrder.Asc, roomId: newRoom.id });

    expect(readMessages.items).toHaveLength(1);
    expect(takeOne(readMessages.items).rowKey).toBe(secondMessage.rowKey);
  });

  // Membership is decided by the shared getMemberProcedure, so it is asserted once for the whole router — a
  // Non-member is refused before any procedure's own guard runs, which is why this reads nothing about authorship
  test("fails read with non-existent member", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    await mockSessionOnce(mockContext.db);

    await expect(messageCaller.readMessages({ roomId: newRoom.id })).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: UNAUTHORIZED]`,
    );
  });

  test("reads by row keys", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const userId = getMockSession().user.id;
    const message = getMessage(userId);
    const newMessage = await messageCaller.createMessage({ message, roomId: newRoom.id });
    const readMessages = await messageCaller.readMessagesByRowKeys({
      roomId: newRoom.id,
      rowKeys: [newMessage.rowKey],
    });

    expect(readMessages).toHaveLength(1);
    expect(takeOne(readMessages).message).toBe(message);
  });

  test("creates", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const userId = getMockSession().user.id;
    const message = getMessage(userId);
    const newMessage = await messageCaller.createMessage({ message, roomId: newRoom.id });

    expect(newMessage).toStrictEqual(
      new StandardMessageEntity({
        createdAt: newMessage.createdAt,
        mentions: [userId],
        message,
        partitionKey: newRoom.id,
        rowKey: newMessage.rowKey,
        type: MessageType.Message,
        updatedAt: newMessage.updatedAt,
        userId,
      }),
    );
  });

  test("creates poll message", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const userId = getMockSession().user.id;
    const newMessage = await messageCaller.createMessage({
      message: pollMessage,
      roomId: newRoom.id,
      type: MessageType.Poll,
    });

    expect(newMessage).toStrictEqual(
      new StandardMessageEntity({
        createdAt: newMessage.createdAt,
        message: pollMessage,
        partitionKey: newRoom.id,
        rowKey: newMessage.rowKey,
        type: MessageType.Poll,
        updatedAt: newMessage.updatedAt,
        userId,
      }),
    );
  });

  // Voting is an operation any member may perform, so it never routes through updateMessage — a poll supports no
  // Update at all, and its own author is not the only one who may vote in it
  test("votes on a poll", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const newMessage = await messageCaller.createMessage({
      message: pollMessage,
      roomId: newRoom.id,
      type: MessageType.Poll,
    });
    const newInvite = await roomCaller.createInvite({ expireAfterMinutes: 0, maxUses: 0, roomId: newRoom.id });
    const { user: member } = await mockSessionOnce(mockContext.db);
    await roomCaller.joinRoom(newInvite.id);
    const compositeKey = { partitionKey: newMessage.partitionKey, rowKey: newMessage.rowKey };
    // Joining posts a system message of its own, so the poll is read back by its own key rather than by position
    const rowKeys = [newMessage.rowKey];
    await mockSessionOnce(mockContext.db, member);
    await messageCaller.votePoll({ ...compositeKey, optionId: pollOptionId });
    const votedMessage = takeOne(await messageCaller.readMessagesByRowKeys({ roomId: newRoom.id, rowKeys }));

    // A vote is not an edit of the poll, so it leaves no edited marker behind
    expect(votedMessage.isEdited).toBeUndefined();
    // The whole body is asserted, not only the votes map: the vote rewrites the stored poll, so anything the
    // Server drops on the way through is gone for good — the option labels first, which the renderer requires
    expect(jsonDateParse(votedMessage.message)).toStrictEqual({
      ...jsonDateParse<PollMessageContent>(pollMessage),
      votes: { [member.id]: pollOptionId },
    });

    await mockSessionOnce(mockContext.db, member);
    await messageCaller.votePoll({ ...compositeKey, optionId: "" });
    const withdrawnMessage = takeOne(await messageCaller.readMessagesByRowKeys({ roomId: newRoom.id, rowKeys }));

    expect(jsonDateParse<{ votes: Record<string, string> }>(withdrawnMessage.message).votes).toStrictEqual({});
  });

  // A vote is a read-modify-write of the whole poll body, so two members voting at once both compute their votes
  // Map from the same stored version. Without a conditional write the later write echoes back a body that never
  // Saw the earlier vote, erasing it with nothing surfaced to either voter. The first vote's write is held open
  // Until the second has landed, which is the interleaving a real deployment produces on its own
  test("keeps both votes when two members vote at once", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const newMessage = await messageCaller.createMessage({
      message: pollMessage,
      roomId: newRoom.id,
      type: MessageType.Poll,
    });
    const newInvite = await roomCaller.createInvite({ expireAfterMinutes: 0, maxUses: 0, roomId: newRoom.id });
    const ownerUserId = getMockSession().user.id;
    const { user: member } = await mockSessionOnce(mockContext.db);
    await roomCaller.joinRoom(newInvite.id);
    const compositeKey = { partitionKey: newMessage.partitionKey, rowKey: newMessage.rowKey };
    const { isFirstWriting, resolveSecondWritten } = holdFirstWrite();
    // Only one session is queued, so the two votes run as the member and the owner — both picking the same
    // Option, so the assertion never depends on which of them ran first
    await mockSessionOnce(mockContext.db, member);
    const firstVote = messageCaller.votePoll({ ...compositeKey, optionId: pollOptionId });
    await isFirstWriting;
    await messageCaller.votePoll({ ...compositeKey, optionId: pollOptionId });
    resolveSecondWritten("");
    await firstVote;
    const votedMessage = takeOne(
      await messageCaller.readMessagesByRowKeys({ roomId: newRoom.id, rowKeys: [newMessage.rowKey] }),
    );

    expect(jsonDateParse<{ votes: Record<string, string> }>(votedMessage.message).votes).toStrictEqual({
      [member.id]: pollOptionId,
      [ownerUserId]: pollOptionId,
    });
  });

  test("fails vote with an option the poll does not offer", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const newMessage = await messageCaller.createMessage({
      message: pollMessage,
      roomId: newRoom.id,
      type: MessageType.Poll,
    });
    const input = { optionId: crypto.randomUUID(), partitionKey: newMessage.partitionKey, rowKey: newMessage.rowKey };

    await expect(messageCaller.votePoll(input)).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new InvalidOperationError(Operation.Update, AzureEntityType.Message, JSON.stringify(input)).message}]`,
    );
  });

  // Whether a poll can be edited is a property of the type, not of the caller, so its own author is refused for
  // The same reason a moderator is — the operation does not exist rather than being out of reach. Which types
  // Support which operations is MessageTypeOperationPermissionMap's matrix; what this pins is the translation
  // Only the procedure makes — an unsupported operation is a bad request, never an unauthorized one
  test("fails update with a poll", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const newInvite = await roomCaller.createInvite({ expireAfterMinutes: 0, maxUses: 0, roomId: newRoom.id });
    const { user: member } = await mockSessionOnce(mockContext.db);
    await roomCaller.joinRoom(newInvite.id);
    await mockSessionOnce(mockContext.db, member);
    const newMessage = await messageCaller.createMessage({
      message: pollMessage,
      roomId: newRoom.id,
      type: MessageType.Poll,
    });
    await mockSessionOnce(mockContext.db, member);

    await expect(
      messageCaller.updateMessage({
        message: updatedMessage,
        partitionKey: newMessage.partitionKey,
        rowKey: newMessage.rowKey,
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new InvalidOperationError(Operation.Update, AzureEntityType.Message, JSON.stringify({ operation: MessageOperation.Update, partitionKey: newMessage.partitionKey, rowKey: newMessage.rowKey })).message}]`,
    );
  });

  test("on creates", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const newInvite = await roomCaller.createInvite({ expireAfterMinutes: 0, maxUses: 0, roomId: newRoom.id });
    const { user } = await mockSessionOnce(mockContext.db);
    await roomCaller.joinRoom(newInvite.id);
    const onCreateMessage = await messageCaller.onCreateMessage({ roomId: newRoom.id });
    const message = getMessage(user.id);
    await mockSessionOnce(mockContext.db, user);
    const trackedData = await getFirstEmit(
      () => onCreateMessage,
      () => messageCaller.createMessage({ message, roomId: newRoom.id }),
    );

    expect(trackedData).toHaveLength(3);

    const [id, data] = trackedData as unknown as TrackedEnvelope<MessageEntity[]>;

    expect(id).toBe(takeOne(data).rowKey);
    expect(data).toHaveLength(1);
    expect(takeOne(data).message).toBe(message);
  });

  test("on creates replays missed messages in ascending order", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const userId = getMockSession().user.id;
    const message = getMessage(userId);
    const firstMessage = await messageCaller.createMessage({ message, roomId: newRoom.id });
    const secondMessage = await messageCaller.createMessage({ message, roomId: newRoom.id });
    const thirdMessage = await messageCaller.createMessage({ message, roomId: newRoom.id });
    const onCreateMessage = await messageCaller.onCreateMessage({
      lastEventId: firstMessage.rowKey,
      roomId: newRoom.id,
    });
    const trackedData = await withAsyncIterator(
      () => onCreateMessage,
      (iterator) => iterator.next(),
    );

    assert(!trackedData.done);

    expect(trackedData.value).toHaveLength(3);

    const [id, data] = trackedData.value as unknown as TrackedEnvelope<MessageEntity[]>;

    expect(id).toBe(thirdMessage.rowKey);
    expect(data).toHaveLength(2);
    expect(takeOne(data).rowKey).toBe(secondMessage.rowKey);
    expect(takeOne(data, 1).rowKey).toBe(thirdMessage.rowKey);
  });

  // The catch-up pages MessagesAscending, whose index row lands ahead of the entity every read serves, so a page
  // Can step past a message whose entity has not landed yet and never come back for it. The emitter listener is
  // What covers that window, which it can only do if it is already attached while the catch-up is still paging
  test("delivers a message created while the catch-up is still paging", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const newInvite = await roomCaller.createInvite({ expireAfterMinutes: 0, maxUses: 0, roomId: newRoom.id });
    const { user } = await mockSessionOnce(mockContext.db);
    await roomCaller.joinRoom(newInvite.id);
    const ownerMessage = await messageCaller.createMessage({
      message: getMessage(getMockSession().user.id),
      roomId: newRoom.id,
    });
    const onCreateMessage = await messageCaller.onCreateMessage({
      lastEventId: ownerMessage.rowKey,
      roomId: newRoom.id,
    });
    // Holds the catch-up open across the racing send, which is the window the listener used to be attached after
    const { promise, resolve } = Promise.withResolvers<string>();
    readMessagesMock.mockImplementationOnce(async () => {
      await promise;
      return { hasMore: false, items: [], nextCursor: "" };
    });
    await mockSessionOnce(mockContext.db, user);
    const trackedData = await withAsyncIterator(
      () => onCreateMessage,
      async (iterator) => {
        const emit = iterator.next();
        await messageCaller.createMessage({ message: getMessage(user.id), roomId: newRoom.id });
        resolve("");
        return emit;
      },
    );

    assert(!trackedData.done);

    const [, data] = trackedData.value as unknown as TrackedEnvelope<MessageEntity[]>;

    expect(data).toHaveLength(1);
  });

  test("on creates typing", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const onCreateTyping = await messageCaller.onCreateTyping({ roomId: newRoom.id });
    const mockSession = getMockSession();
    const data = await getFirstEmit(
      () => onCreateTyping,
      () =>
        messageCaller.createTyping({
          roomId: newRoom.id,
          userId: mockSession.user.id,
          username: mockSession.user.name,
        }),
    );

    expect(data.roomId).toBe(newRoom.id);
  });

  test("updates", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const userId = getMockSession().user.id;
    const message = getMessage(userId);
    const newMessage = await messageCaller.createMessage({
      files: [{ filename, id: crypto.randomUUID(), mimetype, size }],
      message,
      roomId: newRoom.id,
    });
    await messageCaller.updateMessage({
      message: updatedMessage,
      partitionKey: newMessage.partitionKey,
      rowKey: newMessage.rowKey,
    });
    const readMessages = await messageCaller.readMessages({ roomId: newRoom.id });

    expect(readMessages.items).toHaveLength(1);
    expect(takeOne(readMessages.items).isEdited).toBe(true);
    expect(takeOne(readMessages.items).mentions).toHaveLength(0);
    expect(takeOne(readMessages.items).message).toBe(updatedMessage);
  });

  // Who may perform a supported operation is MessageTypeOperationPermissionMap's matrix, which takes `isAuthor`
  // And `hasManageMessages` as given. What only the procedure can get wrong is deriving them from the caller and
  // The stored message, so one member who is neither pins that — every other procedure inherits it unasserted
  test("fails update with a member who is not the author", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const newInvite = await roomCaller.createInvite({ expireAfterMinutes: 0, maxUses: 0, roomId: newRoom.id });
    const message = getMessage(getMockSession().user.id);
    const newMessage = await messageCaller.createMessage({ message, roomId: newRoom.id });
    const { user: member } = await mockSessionOnce(mockContext.db);
    await roomCaller.joinRoom(newInvite.id);
    await mockSessionOnce(mockContext.db, member);

    await expect(
      messageCaller.updateMessage({
        message: updatedMessage,
        partitionKey: newMessage.partitionKey,
        rowKey: newMessage.rowKey,
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`[TRPCError: UNAUTHORIZED]`);
  });

  test("on updates", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const userId = getMockSession().user.id;
    const message = getMessage(userId);
    const newMessage = await messageCaller.createMessage({ message, roomId: newRoom.id });
    const onUpdateMessage = await messageCaller.onUpdateMessage({ roomId: newRoom.id });
    const data = await getFirstEmit(
      () => onUpdateMessage,
      () =>
        messageCaller.updateMessage({
          message: updatedMessage,
          partitionKey: newMessage.partitionKey,
          rowKey: newMessage.rowKey,
        }),
    );

    expect(data.message).toBe(updatedMessage);
  });

  test("deletes", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const userId = getMockSession().user.id;
    const message = getMessage(userId);
    const newMessage = await messageCaller.createMessage({ message, roomId: newRoom.id });
    await messageCaller.deleteMessage({ partitionKey: newMessage.partitionKey, rowKey: newMessage.rowKey });

    const readMessages = await messageCaller.readMessages({ roomId: newRoom.id });

    expect(readMessages.items).toHaveLength(0);
  });

  test("on deletes", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const userId = getMockSession().user.id;
    const message = getMessage(userId);
    const newMessage = await messageCaller.createMessage({ message, roomId: newRoom.id });
    const onDeleteMessage = await messageCaller.onDeleteMessage({ roomId: newRoom.id });
    const data = await getFirstEmit(
      () => onDeleteMessage,
      () =>
        messageCaller.deleteMessage({
          partitionKey: newMessage.partitionKey,
          rowKey: newMessage.rowKey,
        }),
    );

    expect(data.partitionKey).toBe(newMessage.partitionKey);
    expect(data.rowKey).toBe(newMessage.rowKey);
  });

  test("forwards message", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const userId = getMockSession().user.id;
    const message = getMessage(userId);
    const newMessage = await messageCaller.createMessage({ message, roomId: newRoom.id });
    const forwardedRoom = await roomCaller.createRoom({ name });

    await messageCaller.forwardMessage({
      partitionKey: newMessage.partitionKey,
      roomIds: [forwardedRoom.id],
      rowKey: newMessage.rowKey,
    });

    const forwardedMessages = await messageCaller.readMessages({ roomId: forwardedRoom.id });

    expect(forwardedMessages.items).toHaveLength(1);
    expect(takeOne(forwardedMessages.items).isForward).toBe(true);
  });

  test("forwards message with optional message", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const userId = getMockSession().user.id;
    const message = getMessage(userId);
    const newMessage = await messageCaller.createMessage({ message, roomId: newRoom.id });
    const forwardedRoom = await roomCaller.createRoom({ name });

    await messageCaller.forwardMessage({
      message,
      partitionKey: newMessage.partitionKey,
      roomIds: [forwardedRoom.id],
      rowKey: newMessage.rowKey,
    });

    const forwardedMessages = await messageCaller.readMessages({ roomId: forwardedRoom.id });

    expect(forwardedMessages.items).toHaveLength(2);
    // Default read is newest-first: the optional message posts after the forwarded copy, so it leads
    expect(takeOne(forwardedMessages.items).isForward).toBeUndefined();
    expect(takeOne(forwardedMessages.items, 1).isForward).toBe(true);
  });

  test("forwarding a word-filtered message still posts to rooms that did not block, timing out only the blocking room", async () => {
    expect.hasAssertions();

    const sourceRoom = await roomCaller.createRoom({ name });
    const ownerUserId = getMockSession().user.id;
    const source = await messageCaller.createMessage({ message: getMessage(ownerUserId), roomId: sourceRoom.id });
    const filteredRoom = await roomCaller.createRoom({ name });
    await mockContext.db.insert(roomFiltersInMessage).values({
      action: WordFilterAction.Timeout,
      roomId: filteredRoom.id,
      timeoutDurationMs: 1,
      words: [filteredWord],
    });
    const unfilteredRoom = await roomCaller.createRoom({ name });
    const sourceInvite = await roomCaller.createInvite({ expireAfterMinutes: 0, maxUses: 0, roomId: sourceRoom.id });
    const filteredInvite = await roomCaller.createInvite({
      expireAfterMinutes: 0,
      maxUses: 0,
      roomId: filteredRoom.id,
    });
    const unfilteredInvite = await roomCaller.createInvite({
      expireAfterMinutes: 0,
      maxUses: 0,
      roomId: unfilteredRoom.id,
    });
    const { user: member } = await mockSessionOnce(mockContext.db);
    await roomCaller.joinRoom(sourceInvite.id);
    await mockSessionOnce(mockContext.db, member);
    await roomCaller.joinRoom(filteredInvite.id);
    await mockSessionOnce(mockContext.db, member);
    await roomCaller.joinRoom(unfilteredInvite.id);
    await mockSessionOnce(mockContext.db, member);

    await expect(
      messageCaller.forwardMessage({
        message: filteredMessage,
        partitionKey: source.partitionKey,
        roomIds: [filteredRoom.id, unfilteredRoom.id],
        rowKey: source.rowKey,
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`[TRPCError: Message contains blocked content.]`);

    // The unblocked room still received the forward — the whole forward was not aborted for every room.
    const unfilteredMessages = await messageCaller.readMessages({ roomId: unfilteredRoom.id });

    expect(unfilteredMessages.items.filter(({ isForward }) => isForward)).toHaveLength(1);

    // The sender is not timed out where nothing was blocked — the timeout only accompanies a real per-room block.
    const [unfilteredMembership] = await mockContext.db
      .select()
      .from(usersToRoomsInMessage)
      .where(and(eq(usersToRoomsInMessage.roomId, unfilteredRoom.id), eq(usersToRoomsInMessage.userId, member.id)));

    expect(unfilteredMembership?.timeoutUntil).toBeNull();
  });

  // Only one rejection can be surfaced to the caller, so the rest have to be logged — otherwise a room that
  // Failed for its own reason ends up with no forward and nothing anywhere saying so
  test("logs every room a forward failed for", async () => {
    expect.hasAssertions();

    const sourceRoom = await roomCaller.createRoom({ name });
    const source = await messageCaller.createMessage({ message: filteredMessage, roomId: sourceRoom.id });
    const firstFilteredRoom = await roomCaller.createRoom({ name });
    const secondFilteredRoom = await roomCaller.createRoom({ name });
    await mockContext.db.insert(roomFiltersInMessage).values([
      { roomId: firstFilteredRoom.id, words: [filteredWord] },
      { roomId: secondFilteredRoom.id, words: [filteredWord] },
    ]);
    const invites = await Promise.all(
      [sourceRoom.id, firstFilteredRoom.id, secondFilteredRoom.id].map((roomId) =>
        roomCaller.createInvite({ expireAfterMinutes: 0, maxUses: 0, roomId }),
      ),
    );
    // The filter never applies to a member who can manage messages, so the forward is sent by a plain member
    const { user: member } = await mockSessionOnce(mockContext.db);
    for (const invite of invites) {
      await roomCaller.joinRoom(invite.id);
      await mockSessionOnce(mockContext.db, member);
    }

    await expect(
      messageCaller.forwardMessage({
        partitionKey: source.partitionKey,
        roomIds: [firstFilteredRoom.id, secondFilteredRoom.id],
        rowKey: source.rowKey,
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`[TRPCError: Message contains blocked content.]`);

    expect(consoleErrorSpy).toHaveBeenCalledTimes(2);
  });

  test("forwarding is blocked by the forwarded body's own text, with or without an accompanying message", async () => {
    expect.hasAssertions();

    // The forwarded body is the text that lands in the destination room, so filtering only the note attached to
    // The forward makes forwarding from an unfiltered room a way around the filter entirely. Both texts are
    // Checked together, so a clean note alongside a filtered body does not buy the forward a pass either.
    const sourceRoom = await roomCaller.createRoom({ name });
    const source = await messageCaller.createMessage({ message: filteredMessage, roomId: sourceRoom.id });
    const filteredRoom = await roomCaller.createRoom({ name });
    await mockContext.db.insert(roomFiltersInMessage).values({ roomId: filteredRoom.id, words: [filteredWord] });
    const sourceInvite = await roomCaller.createInvite({ expireAfterMinutes: 0, maxUses: 0, roomId: sourceRoom.id });
    const filteredInvite = await roomCaller.createInvite({
      expireAfterMinutes: 0,
      maxUses: 0,
      roomId: filteredRoom.id,
    });
    const { user: member } = await mockSessionOnce(mockContext.db);
    await roomCaller.joinRoom(sourceInvite.id);
    await mockSessionOnce(mockContext.db, member);
    await roomCaller.joinRoom(filteredInvite.id);
    await mockSessionOnce(mockContext.db, member);

    await expect(
      messageCaller.forwardMessage({
        partitionKey: source.partitionKey,
        roomIds: [filteredRoom.id],
        rowKey: source.rowKey,
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`[TRPCError: Message contains blocked content.]`);

    await mockSessionOnce(mockContext.db, member);

    await expect(
      messageCaller.forwardMessage({
        message: getMessage(member.id),
        partitionKey: source.partitionKey,
        roomIds: [filteredRoom.id],
        rowKey: source.rowKey,
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`[TRPCError: Message contains blocked content.]`);

    await mockSessionOnce(mockContext.db, member);
    const filteredMessages = await messageCaller.readMessages({ roomId: filteredRoom.id });

    expect(filteredMessages.items.filter(({ isForward }) => isForward)).toHaveLength(0);
  });

  // Two files a user genuinely named the same are one ordinary drop: each write target is minted under its own
  // Id, so the shared name collides nowhere and must not fail the selection
  test("generates upload file SAS entities", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const sasEntities = await messageCaller.generateUploadFileSasEntities({
      files: [
        { filename, mimetype, size },
        { filename, mimetype, size },
      ],
      roomId: newRoom.id,
    });

    expect(sasEntities).toHaveLength(2);
    expect(new Set(sasEntities.map(({ id }) => id)).size).toBe(2);
  });

  test("reclaims an upload the caller was granted", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const [sasEntity] = await messageCaller.generateUploadFileSasEntities({
      files: [{ filename, mimetype, size }],
      roomId: newRoom.id,
    });
    assert(sasEntity);
    await messageCaller.deleteUploadFiles({
      files: [{ filename, id: sasEntity.id, token: sasEntity.token }],
      roomId: newRoom.id,
    });
    const blobDeletionEvents = MockEventGridDatabase.get("");
    assert(blobDeletionEvents);

    expect(takeOne(blobDeletionEvents).data as BlobDeletionEventGridData).toStrictEqual({
      blobNames: [
        getBlobName(`${newRoom.id}/${sasEntity.id}`, filename),
        getThumbnailBlobName(newRoom.id, sasEntity.id),
      ],
      containerName: AzureContainer.MessageAssets,
    });
  });

  // The grant says which blob, never what it is called: the name is interpolated into a blob path that the
  // Storage sdk resolves through `URL.pathname`, so dot segments in a filename walk the delete out of the room
  test("fails to reclaim an upload whose filename escapes the room prefix", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const [sasEntity] = await messageCaller.generateUploadFileSasEntities({
      files: [{ filename, mimetype, size }],
      roomId: newRoom.id,
    });
    assert(sasEntity);

    await expect(
      messageCaller.deleteUploadFiles({
        files: [{ filename: `../../${crypto.randomUUID()}/${filename}`, id: sasEntity.id, token: sasEntity.token }],
        roomId: newRoom.id,
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      [TRPCError: [
        {
          "origin": "string",
          "code": "invalid_format",
          "format": "regex",
          "pattern": "/^(?!\\\\.{1,2}$)[^/\\\\\\\\]+$/u",
          "path": [
            "files",
            0,
            "filename"
          ],
          "message": "Invalid string: must match pattern /^(?!\\\\.{1,2}$)[^/\\\\\\\\]+$/u"
        }
      ]]
    `);
    expect(MockEventGridDatabase.get("")).toBeUndefined();
  });

  // Past the write sas the upload has either landed on a message — where the blob belongs to that message, not
  // To a loose upload — or been abandoned; a grant valid past both deletes a posted attachment out from under it
  test("fails to reclaim an upload after the grant expires", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const [sasEntity] = await messageCaller.generateUploadFileSasEntities({
      files: [{ filename, mimetype, size }],
      roomId: newRoom.id,
    });
    assert(sasEntity);
    vi.useFakeTimers({ now: dayjs().add(WRITE_SAS_DURATION_MS, "ms").add(1, "ms").toDate() });

    await expect(
      messageCaller.deleteUploadFiles({
        files: [{ filename, id: sasEntity.id, token: sasEntity.token }],
        roomId: newRoom.id,
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`[TRPCError: UNAUTHORIZED]`);

    expect(MockEventGridDatabase.get("")).toBeUndefined();
  });

  // The blob names an unreferenced upload and a posted attachment live under are the same room-scoped namespace,
  // And every member reads every attachment's id off the wire — so membership alone would let any of them
  // Permanently destroy anyone else's posted files, with no entity left saying it happened
  test("fails to reclaim an upload granted to another member", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const newInvite = await roomCaller.createInvite({ expireAfterMinutes: 0, maxUses: 0, roomId: newRoom.id });
    const [sasEntity] = await messageCaller.generateUploadFileSasEntities({
      files: [{ filename, mimetype, size }],
      roomId: newRoom.id,
    });
    assert(sasEntity);
    const { user: member } = await mockSessionOnce(mockContext.db);
    await roomCaller.joinRoom(newInvite.id);
    await mockSessionOnce(mockContext.db, member);

    await expect(
      messageCaller.deleteUploadFiles({
        files: [{ filename, id: sasEntity.id, token: sasEntity.token }],
        roomId: newRoom.id,
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`[TRPCError: UNAUTHORIZED]`);

    expect(MockEventGridDatabase.get("")).toBeUndefined();
  });

  test("generates download file SAS URLs", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const files = [{ filename, id: crypto.randomUUID(), mimetype }];
    const sasUrls = await messageCaller.generateDownloadFileSasUrls({ files, roomId: newRoom.id });

    expect(sasUrls).toHaveLength(1);
  });

  test("deletes file", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const id = crypto.randomUUID();
    const newMessage = await messageCaller.createMessage({
      files: [{ filename, id, mimetype, size }],
      roomId: newRoom.id,
    });
    MockContainerDatabase.set(
      AzureContainer.MessageAssets,
      new Map([[getBlobName(`${newRoom.id}/${id}`, filename), Buffer.alloc(size)]]),
    );

    await messageCaller.deleteFile({ id, partitionKey: newMessage.partitionKey, rowKey: newMessage.rowKey });

    const updatedMessages = await messageCaller.readMessagesByRowKeys({
      roomId: newRoom.id,
      rowKeys: [newMessage.rowKey],
    });

    expect(updatedMessages).toHaveLength(1);
    expect(takeOne(updatedMessages).files).toHaveLength(0);
  });

  // Removing one file rewrites the whole files array, so the write is conditional: an unconditional second write
  // Computes its survivors from the version before the first deletion and reinstates that file, leaving the
  // Message pointing at a blob whose deletion has already been published
  test("deletes two files at once without reinstating either", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const firstId = crypto.randomUUID();
    const secondId = crypto.randomUUID();
    const newMessage = await messageCaller.createMessage({
      files: [
        { filename, id: firstId, mimetype, size },
        { filename, id: secondId, mimetype, size },
      ],
      roomId: newRoom.id,
    });
    const compositeKey = { partitionKey: newMessage.partitionKey, rowKey: newMessage.rowKey };
    const { isFirstWriting, resolveSecondWritten } = holdFirstWrite();
    const firstDelete = messageCaller.deleteFile({ ...compositeKey, id: firstId });
    await isFirstWriting;
    await messageCaller.deleteFile({ ...compositeKey, id: secondId });
    resolveSecondWritten("");
    await firstDelete;

    const updatedMessages = await messageCaller.readMessagesByRowKeys({
      roomId: newRoom.id,
      rowKeys: [newMessage.rowKey],
    });

    expect(takeOne(updatedMessages).files).toHaveLength(0);
  });

  test("publishes thumbnail deletion on delete file", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const id = crypto.randomUUID();
    const newMessage = await messageCaller.createMessage({
      files: [{ filename, id, mimetype, size }],
      roomId: newRoom.id,
    });

    await messageCaller.deleteFile({ id, partitionKey: newMessage.partitionKey, rowKey: newMessage.rowKey });

    const blobDeletionEvents = MockEventGridDatabase.get("");
    assert(blobDeletionEvents);

    expect(blobDeletionEvents).toHaveLength(1);
    expect(takeOne(blobDeletionEvents).data as BlobDeletionEventGridData).toStrictEqual({
      blobNames: [getBlobName(`${newRoom.id}/${id}`, filename), getThumbnailBlobName(newRoom.id, id)],
      containerName: AzureContainer.MessageAssets,
    });
  });

  test("publishes thumbnail deletion on delete message", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const id = crypto.randomUUID();
    const newMessage = await messageCaller.createMessage({
      files: [{ filename, id, mimetype, size }],
      roomId: newRoom.id,
    });

    await messageCaller.deleteMessage({ partitionKey: newMessage.partitionKey, rowKey: newMessage.rowKey });

    const blobDeletionEvents = MockEventGridDatabase.get("");
    assert(blobDeletionEvents);

    expect(blobDeletionEvents).toHaveLength(1);
    expect(takeOne(blobDeletionEvents).data as BlobDeletionEventGridData).toStrictEqual({
      blobNames: [getBlobName(`${newRoom.id}/${id}`, filename), getThumbnailBlobName(newRoom.id, id)],
      containerName: AzureContainer.MessageAssets,
    });
  });

  test("fails delete file with non-existent file id", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const newFileId = crypto.randomUUID();
    const deleteFileId = crypto.randomUUID();
    const newMessage = await messageCaller.createMessage({
      files: [{ filename, id: newFileId, mimetype, size }],
      roomId: newRoom.id,
    });
    MockContainerDatabase.set(
      AzureContainer.MessageAssets,
      new Map([[getBlobName(`${newRoom.id}/${newFileId}`, filename), Buffer.alloc(size)]]),
    );

    await expect(
      messageCaller.deleteFile({ id: deleteFileId, partitionKey: newMessage.partitionKey, rowKey: newMessage.rowKey }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new NotFoundError(AzureEntityType.File, deleteFileId).message}]`,
    );
  });

  test("fails delete file with forward", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const id = crypto.randomUUID();
    const userId = getMockSession().user.id;
    const message = getMessage(userId);
    const newMessage = await messageCaller.createMessage({
      files: [{ filename, id, mimetype, size }],
      message,
      roomId: newRoom.id,
    });
    MockContainerDatabase.set(
      AzureContainer.MessageAssets,
      new Map([[getBlobName(`${newRoom.id}/${id}`, filename), Buffer.alloc(size)]]),
    );
    const onCreateMessage = await messageCaller.onCreateMessage({ roomId: newRoom.id });
    const trackedData = await getFirstEmit(
      () => onCreateMessage,
      () =>
        messageCaller.forwardMessage({
          partitionKey: newMessage.partitionKey,
          roomIds: [newRoom.id],
          rowKey: newMessage.rowKey,
        }),
    );

    const [, data] = trackedData as unknown as TrackedEnvelope<MessageEntity[]>;

    expect(data).toHaveLength(1);
    await expect(
      messageCaller.deleteFile({
        id,
        partitionKey: takeOne(data).partitionKey,
        rowKey: takeOne(data).rowKey,
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new InvalidOperationError(Operation.Delete, AzureEntityType.Message, id).message}]`,
    );
  });

  test("fails delete file with message without files", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const userId = getMockSession().user.id;
    const message = getMessage(userId);
    const newMessage = await messageCaller.createMessage({ message, roomId: newRoom.id });

    const id = crypto.randomUUID();

    await expect(
      messageCaller.deleteFile({
        id,
        partitionKey: newMessage.partitionKey,
        rowKey: newMessage.rowKey,
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new InvalidOperationError(Operation.Delete, AzureEntityType.Message, id).message}]`,
    );
  });

  test("deletes link preview response", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const userId = getMockSession().user.id;
    const message = getMessage(userId);
    const newMessage = await messageCaller.createMessage({ message, roomId: newRoom.id });

    await messageCaller.deleteLinkPreviewResponse({
      partitionKey: newMessage.partitionKey,
      rowKey: newMessage.rowKey,
    });

    const updatedMessages = await messageCaller.readMessagesByRowKeys({
      roomId: newRoom.id,
      rowKeys: [newMessage.rowKey],
    });

    expect(updatedMessages).toHaveLength(1);
    expect(takeOne(updatedMessages).linkPreviewResponse).toBeNull();
  });

  // Clearing the preview needs a Replace, so the write carries the whole body: replayed from the version this
  // Procedure first read, it reverts every concurrent change rather than only clearing the preview
  test("deletes link preview response without reverting a concurrent edit", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const message = getMessage(getMockSession().user.id);
    const newMessage = await messageCaller.createMessage({ message, roomId: newRoom.id });
    const compositeKey = { partitionKey: newMessage.partitionKey, rowKey: newMessage.rowKey };
    const { isFirstWriting, resolveSecondWritten } = holdFirstWrite();
    const clearLinkPreviewResponse = messageCaller.deleteLinkPreviewResponse(compositeKey);
    await isFirstWriting;
    await messageCaller.updateMessage({ ...compositeKey, message: updatedMessage });
    resolveSecondWritten("");
    await clearLinkPreviewResponse;

    const updatedMessages = await messageCaller.readMessagesByRowKeys({
      roomId: newRoom.id,
      rowKeys: [newMessage.rowKey],
    });

    expect(takeOne(updatedMessages).linkPreviewResponse).toBeNull();
    expect(takeOne(updatedMessages).message).toBe(updatedMessage);
  });

  test("pins message and creates system message", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const userId = getMockSession().user.id;
    const message = getMessage(userId);
    const newMessage = await messageCaller.createMessage({ message, roomId: newRoom.id });

    await messageCaller.pinMessage({ partitionKey: newMessage.partitionKey, rowKey: newMessage.rowKey });

    const readMessages = await messageCaller.readMessages({ roomId: newRoom.id });

    expect(readMessages.items).toHaveLength(2);
    // Default read is newest-first: the pin system message posts after the pinned message, so it leads
    expect(takeOne(readMessages.items).type).toBe(MessageType.PinMessage);
    expect(takeOne(readMessages.items).replyRowKey).toBe(newMessage.rowKey);
    expect(takeOne(readMessages.items, 1).partitionKey).toBe(newMessage.partitionKey);
    expect(takeOne(readMessages.items, 1).rowKey).toBe(newMessage.rowKey);
    expect(takeOne(readMessages.items, 1).isPinned).toBe(true);
  });

  test("unpins message", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const userId = getMockSession().user.id;
    const message = getMessage(userId);
    const newMessage = await messageCaller.createMessage({ message, roomId: newRoom.id });

    await messageCaller.pinMessage({ partitionKey: newMessage.partitionKey, rowKey: newMessage.rowKey });
    await messageCaller.unpinMessage({ partitionKey: newMessage.partitionKey, rowKey: newMessage.rowKey });

    const readMessages = await messageCaller.readMessages({ roomId: newRoom.id });

    // Unpinning posts no system message of its own, so the pin's is still the only one and the unpinned message
    // Sits behind it — asserting the lead item would only prove a system message never carried a pin
    expect(readMessages.items).toHaveLength(2);
    expect(takeOne(readMessages.items, 1).isPinned).toBeUndefined();
  });

  // Unpinning needs the same Replace as clearing the preview, and inherits the same hazard: the body it writes
  // Must be the one it re-read, not the one it started from
  test("unpins message without reverting a concurrent edit", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const message = getMessage(getMockSession().user.id);
    const newMessage = await messageCaller.createMessage({ message, roomId: newRoom.id });
    const compositeKey = { partitionKey: newMessage.partitionKey, rowKey: newMessage.rowKey };
    await messageCaller.pinMessage(compositeKey);
    const { isFirstWriting, resolveSecondWritten } = holdFirstWrite();
    const unpin = messageCaller.unpinMessage(compositeKey);
    await isFirstWriting;
    await messageCaller.updateMessage({ ...compositeKey, message: updatedMessage });
    resolveSecondWritten("");
    await unpin;

    const updatedMessages = await messageCaller.readMessagesByRowKeys({
      roomId: newRoom.id,
      rowKeys: [newMessage.rowKey],
    });

    expect(takeOne(updatedMessages).isPinned).toBeUndefined();
    expect(takeOne(updatedMessages).message).toBe(updatedMessage);
  });

  describe("slowmode guard", () => {
    beforeEach(() => {
      vi.useFakeTimers({ now: 0 });
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    test("second message within slowmode window throws TOO_MANY_REQUESTS", async () => {
      expect.hasAssertions();

      const newRoom = await roomCaller.createRoom({ name });
      await roomCaller.updateRoom({ id: newRoom.id, slowmodeMs: 2 });
      const invite = await roomCaller.createInvite({ expireAfterMinutes: 0, maxUses: 0, roomId: newRoom.id });
      const { user } = await mockSessionOnce(mockContext.db);
      await roomCaller.joinRoom(invite.id);
      const message = getMessage(user.id);

      await mockSessionOnce(mockContext.db, user);
      vi.advanceTimersByTime(1);
      await messageCaller.createMessage({ message, roomId: newRoom.id });
      await mockSessionOnce(mockContext.db, user);
      vi.advanceTimersByTime(1);

      await expect(
        messageCaller.createMessage({ message, roomId: newRoom.id }),
      ).rejects.toThrowErrorMatchingInlineSnapshot(`[TRPCError: TOO_MANY_REQUESTS]`);
    });

    test("message after slowmode window succeeds", async () => {
      expect.hasAssertions();

      const newRoom = await roomCaller.createRoom({ name });
      await roomCaller.updateRoom({ id: newRoom.id, slowmodeMs: 1 });
      const invite = await roomCaller.createInvite({ expireAfterMinutes: 0, maxUses: 0, roomId: newRoom.id });
      const { user } = await mockSessionOnce(mockContext.db);
      await roomCaller.joinRoom(invite.id);
      const message = getMessage(user.id);

      await mockSessionOnce(mockContext.db, user);
      vi.advanceTimersByTime(1);
      await messageCaller.createMessage({ message, roomId: newRoom.id });
      await mockSessionOnce(mockContext.db, user);
      vi.advanceTimersByTime(1);

      const createdMessage = await messageCaller.createMessage({ message, roomId: newRoom.id });

      expect(createdMessage).toBeDefined();
    });

    test("second forward within slowmode window throws TOO_MANY_REQUESTS", async () => {
      expect.hasAssertions();

      // A forward is a send, so it advances the same clock it was checked against — otherwise the stale
      // LastMessageAt keeps passing and forwarding floods a room slowmode is supposed to throttle
      const newRoom = await roomCaller.createRoom({ name });
      const source = await messageCaller.createMessage({
        message: getMessage(getMockSession().user.id),
        roomId: newRoom.id,
      });
      await roomCaller.updateRoom({ id: newRoom.id, slowmodeMs: 2 });
      const invite = await roomCaller.createInvite({ expireAfterMinutes: 0, maxUses: 0, roomId: newRoom.id });
      const { user } = await mockSessionOnce(mockContext.db);
      await roomCaller.joinRoom(invite.id);
      const forwardInput = {
        partitionKey: source.partitionKey,
        roomIds: [newRoom.id],
        rowKey: source.rowKey,
      };

      await mockSessionOnce(mockContext.db, user);
      vi.advanceTimersByTime(1);
      await messageCaller.forwardMessage(forwardInput);
      await mockSessionOnce(mockContext.db, user);
      vi.advanceTimersByTime(1);

      await expect(messageCaller.forwardMessage(forwardInput)).rejects.toThrowErrorMatchingInlineSnapshot(
        `[TRPCError: TOO_MANY_REQUESTS]`,
      );
    });

    test("second message within slowmode window from someone who can manage messages succeeds", async () => {
      expect.hasAssertions();

      // Slowmode throttles the room, not its moderators — the owner sends as fast as they like
      const newRoom = await roomCaller.createRoom({ name });
      await roomCaller.updateRoom({ id: newRoom.id, slowmodeMs: 2 });
      const userId = getMockSession().user.id;
      const message = getMessage(userId);
      vi.advanceTimersByTime(1);
      await messageCaller.createMessage({ message, roomId: newRoom.id });
      vi.advanceTimersByTime(1);

      const createdMessage = await messageCaller.createMessage({ message, roomId: newRoom.id });

      expect(createdMessage).toBeDefined();
    });
  });

  describe("createMessage read-only guard", () => {
    test("message from a member of a read-only room throws FORBIDDEN", async () => {
      expect.hasAssertions();

      const newRoom = await roomCaller.createRoom({ name });
      await roomCaller.updateRoom({ id: newRoom.id, isReadOnly: true });
      const invite = await roomCaller.createInvite({ expireAfterMinutes: 0, maxUses: 0, roomId: newRoom.id });
      const { user } = await mockSessionOnce(mockContext.db);
      await roomCaller.joinRoom(invite.id);
      const message = getMessage(user.id);
      await mockSessionOnce(mockContext.db, user);

      await expect(
        messageCaller.createMessage({ message, roomId: newRoom.id }),
      ).rejects.toThrowErrorMatchingInlineSnapshot(`[TRPCError: FORBIDDEN]`);
    });

    test("message from someone who can manage messages succeeds in a read-only room", async () => {
      expect.hasAssertions();

      // Read-only silences the room, not its moderators — the owner always may
      const newRoom = await roomCaller.createRoom({ name });
      await roomCaller.updateRoom({ id: newRoom.id, isReadOnly: true });
      const userId = getMockSession().user.id;

      const createdMessage = await messageCaller.createMessage({ message: getMessage(userId), roomId: newRoom.id });

      expect(createdMessage).toBeDefined();
    });
  });

  describe("createMessage timeout guard", () => {
    // The clock is pinned so "timed out until 1ms from now" is still true by the time the message lands
    beforeEach(() => {
      vi.useFakeTimers({ now: 0 });
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    test("message from a timed out member throws FORBIDDEN", async () => {
      expect.hasAssertions();

      const newRoom = await roomCaller.createRoom({ name });
      const invite = await roomCaller.createInvite({ expireAfterMinutes: 0, maxUses: 0, roomId: newRoom.id });
      const { user } = await mockSessionOnce(mockContext.db);
      await roomCaller.joinRoom(invite.id);
      await mockContext.db
        .update(usersToRoomsInMessage)
        .set({ timeoutUntil: new Date(Date.now() + 1) })
        .where(and(eq(usersToRoomsInMessage.roomId, newRoom.id), eq(usersToRoomsInMessage.userId, user.id)));
      const message = getMessage(user.id);
      await mockSessionOnce(mockContext.db, user);

      await expect(
        messageCaller.createMessage({ message, roomId: newRoom.id }),
      ).rejects.toThrowErrorMatchingInlineSnapshot(`[TRPCError: FORBIDDEN]`);
    });

    test("a timed out owner is still timed out", async () => {
      expect.hasAssertions();

      // A timeout outranks every permission, so it is the one rule managing messages cannot talk its way past
      const newRoom = await roomCaller.createRoom({ name });
      const userId = getMockSession().user.id;
      await mockContext.db
        .update(usersToRoomsInMessage)
        .set({ timeoutUntil: new Date(Date.now() + 1) })
        .where(and(eq(usersToRoomsInMessage.roomId, newRoom.id), eq(usersToRoomsInMessage.userId, userId)));

      await expect(
        messageCaller.createMessage({ message: getMessage(userId), roomId: newRoom.id }),
      ).rejects.toThrowErrorMatchingInlineSnapshot(`[TRPCError: FORBIDDEN]`);
    });
  });

  describe("createMessage word filter guard", () => {
    test("message with a blocked word from someone who can manage messages succeeds", async () => {
      expect.hasAssertions();

      // The filter is a moderation tool, so it never fires on the moderator wielding it
      const newRoom = await roomCaller.createRoom({ name });
      await mockContext.db.insert(roomFiltersInMessage).values({ roomId: newRoom.id, words: [filteredWord] });

      const createdMessage = await messageCaller.createMessage({
        message: filteredMessage,
        roomId: newRoom.id,
      });

      expect(createdMessage).toBeDefined();
    });

    test("message with blocked word throws FORBIDDEN", async () => {
      expect.hasAssertions();

      const newRoom = await roomCaller.createRoom({ name });
      await mockContext.db.insert(roomFiltersInMessage).values({ roomId: newRoom.id, words: [filteredWord] });
      const invite = await roomCaller.createInvite({ expireAfterMinutes: 0, maxUses: 0, roomId: newRoom.id });
      const { user } = await mockSessionOnce(mockContext.db);
      await roomCaller.joinRoom(invite.id);
      await mockSessionOnce(mockContext.db, user);

      await expect(
        messageCaller.createMessage({ message: filteredMessage, roomId: newRoom.id }),
      ).rejects.toThrowErrorMatchingInlineSnapshot(`[TRPCError: Message contains blocked content.]`);
    });

    test("message without blocked word succeeds", async () => {
      expect.hasAssertions();

      const newRoom = await roomCaller.createRoom({ name });
      await mockContext.db.insert(roomFiltersInMessage).values({ roomId: newRoom.id, words: [filteredWord] });
      const userId = getMockSession().user.id;
      const message = getMessage(userId);

      const createdMessage = await messageCaller.createMessage({ message, roomId: newRoom.id });

      expect(createdMessage).toBeDefined();
    });

    test(`blocked word with the ${WordFilterAction.Timeout} action rejects the message and times out the sender`, async () => {
      expect.hasAssertions();

      const timeoutDurationMs = 1;
      const newRoom = await roomCaller.createRoom({ name });
      await mockContext.db
        .insert(roomFiltersInMessage)
        .values({ action: WordFilterAction.Timeout, roomId: newRoom.id, timeoutDurationMs, words: [filteredWord] });
      const invite = await roomCaller.createInvite({ expireAfterMinutes: 0, maxUses: 0, roomId: newRoom.id });
      const { user } = await mockSessionOnce(mockContext.db);
      await roomCaller.joinRoom(invite.id);
      await mockSessionOnce(mockContext.db, user);
      const beforeCreateMessageTime = Date.now();

      await expect(
        messageCaller.createMessage({ message: filteredMessage, roomId: newRoom.id }),
      ).rejects.toThrowErrorMatchingInlineSnapshot(`[TRPCError: Message contains blocked content.]`);

      const [membership] = await mockContext.db
        .select()
        .from(usersToRoomsInMessage)
        .where(and(eq(usersToRoomsInMessage.roomId, newRoom.id), eq(usersToRoomsInMessage.userId, user.id)));

      expect(membership?.timeoutUntil?.getTime()).toBeGreaterThanOrEqual(beforeCreateMessageTime + timeoutDurationMs);
    });
  });

  describe("thread follows", () => {
    test("followThread then readFollowedThreads returns the thread root", async () => {
      expect.hasAssertions();

      const newRoom = await roomCaller.createRoom({ name });
      const userId = getMockSession().user.id;
      const root = await messageCaller.createMessage({ message: getMessage(userId), roomId: newRoom.id });
      await messageCaller.followThread({ roomId: newRoom.id, threadRootRowKey: root.rowKey });

      const { threads } = await messageCaller.readFollowedThreads({ roomId: newRoom.id });

      expect(threads).toHaveLength(1);
      expect(takeOne(threads).rowKey).toBe(root.rowKey);
    });

    test("unfollowThread removes the follow", async () => {
      expect.hasAssertions();

      const newRoom = await roomCaller.createRoom({ name });
      const userId = getMockSession().user.id;
      const root = await messageCaller.createMessage({ message: getMessage(userId), roomId: newRoom.id });
      await messageCaller.followThread({ roomId: newRoom.id, threadRootRowKey: root.rowKey });
      await messageCaller.unfollowThread({ roomId: newRoom.id, threadRootRowKey: root.rowKey });

      const { threads } = await messageCaller.readFollowedThreads({ roomId: newRoom.id });

      expect(threads).toHaveLength(0);
    });

    test("readFollowedThreads keeps a follow whose root was deleted while the display list drops it", async () => {
      expect.hasAssertions();

      const newRoom = await roomCaller.createRoom({ name });
      const userId = getMockSession().user.id;
      const root = await messageCaller.createMessage({ message: getMessage(userId), roomId: newRoom.id });
      await messageCaller.followThread({ roomId: newRoom.id, threadRootRowKey: root.rowKey });
      await messageCaller.deleteMessage({ partitionKey: root.partitionKey, rowKey: root.rowKey });

      const { threadRootRowKeys, threads } = await messageCaller.readFollowedThreads({ roomId: newRoom.id });

      expect(threadRootRowKeys).toStrictEqual([root.rowKey]);
      expect(threads).toHaveLength(0);

      await messageCaller.unfollowThread({ roomId: newRoom.id, threadRootRowKey: root.rowKey });

      const { threadRootRowKeys: threadRootRowKeysAfterUnfollow } = await messageCaller.readFollowedThreads({
        roomId: newRoom.id,
      });

      expect(threadRootRowKeysAfterUnfollow).toHaveLength(0);
    });
  });
});
