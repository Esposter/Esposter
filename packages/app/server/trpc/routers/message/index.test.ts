// @vitest-environment nuxt
import type { Context } from "@@/server/trpc/context";
import type { TRPCRouter } from "@@/server/trpc/routers";
import type { BlobDeletionEventGridData, MessageEntity } from "@esposter/db-schema";
import type { DecorateRouterRecord, TrackedEnvelope } from "@trpc/server/unstable-core-do-not-import";

import { SortOrder } from "#shared/models/pagination/sorting/SortOrder";
import { dayjs } from "#shared/services/dayjs";
import { MESSAGE_ROWKEY_SORT_ITEM } from "#shared/services/pagination/constants";
import { serialize } from "#shared/services/pagination/cursor/serialize";
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
  MENTION_ID_ATTRIBUTE,
  MENTION_TYPE,
  MENTION_TYPE_ATTRIBUTE,
  NotFoundError,
  Operation,
  takeOne,
} from "@esposter/shared";
import { MockContainerDatabase, MockEventGridDatabase, MockSearchDatabase, MockTableDatabase } from "azure-mock";
import { and, eq } from "drizzle-orm";
import { afterEach, assert, beforeAll, beforeEach, describe, expect, test, vi } from "vitest";

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

  beforeAll(async () => {
    mockContext = await createMockContext();
    messageCaller = createCallerFactory(messageRouter)(mockContext);
    roomCaller = createCallerFactory(roomRouter)(mockContext);
  });

  afterEach(async () => {
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

    let cursor = serialize({ rowKey: getReverseTickedTimestamp(firstMessage.rowKey) }, [MESSAGE_ROWKEY_SORT_ITEM]);
    readMessages = await messageCaller.readMessages({
      cursor,
      order: SortOrder.Asc,
      roomId: newRoom.id,
    });

    expect(readMessages.items).toHaveLength(1);
    expect(takeOne(readMessages.items).rowKey).toBe(secondMessage.rowKey);

    cursor = serialize({ rowKey: getReverseTickedTimestamp(firstMessage.rowKey) }, [MESSAGE_ROWKEY_SORT_ITEM]);
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
    const message = JSON.stringify({
      options: [
        { id: crypto.randomUUID(), label: "Option A" },
        { id: crypto.randomUUID(), label: "Option B" },
      ],
      question: "Test question",
      votes: {},
    });
    const newMessage = await messageCaller.createMessage({ message, roomId: newRoom.id, type: MessageType.Poll });

    expect(newMessage).toStrictEqual(
      new StandardMessageEntity({
        createdAt: newMessage.createdAt,
        message,
        partitionKey: newRoom.id,
        rowKey: newMessage.rowKey,
        type: MessageType.Poll,
        updatedAt: newMessage.updatedAt,
        userId,
      }),
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

  test("fails update with wrong user", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const userId = getMockSession().user.id;
    const message = getMessage(userId);
    const newMessage = await messageCaller.createMessage({ message, roomId: newRoom.id });
    await mockSessionOnce(mockContext.db);

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

  test("fails delete with wrong user", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const userId = getMockSession().user.id;
    const message = getMessage(userId);
    const newMessage = await messageCaller.createMessage({ message, roomId: newRoom.id });
    await mockSessionOnce(mockContext.db);

    await expect(
      messageCaller.deleteMessage({ partitionKey: newMessage.partitionKey, rowKey: newMessage.rowKey }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`[TRPCError: UNAUTHORIZED]`);
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
    await mockContext.db
      .insert(roomFiltersInMessage)
      .values({ action: WordFilterAction.Timeout, roomId: filteredRoom.id, timeoutDurationMs: 1, words: ["spam"] });
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
        message: `<p>this is spam</p>`,
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

  test("generates upload file SAS entities", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const sasEntities = await messageCaller.generateUploadFileSasEntities({
      files: [{ filename, mimetype, size }],
      roomId: newRoom.id,
    });

    expect(sasEntities).toHaveLength(1);
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
    vi.useFakeTimers();
    vi.setSystemTime(dayjs().add(WRITE_SAS_DURATION_MS, "ms").add(1, "ms").toDate());

    await expect(
      messageCaller.deleteUploadFiles({
        files: [{ filename, id: sasEntity.id, token: sasEntity.token }],
        roomId: newRoom.id,
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`[TRPCError: UNAUTHORIZED]`);

    vi.useRealTimers();

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

  test("fails delete file with wrong user", async () => {
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
    await mockSessionOnce(mockContext.db);

    await expect(
      messageCaller.deleteFile({
        id,
        partitionKey: newMessage.partitionKey,
        rowKey: newMessage.rowKey,
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`[TRPCError: UNAUTHORIZED]`);
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

  test("fails delete link preview response with wrong user", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const userId = getMockSession().user.id;
    const message = getMessage(userId);
    const newMessage = await messageCaller.createMessage({ message, roomId: newRoom.id });
    await mockSessionOnce(mockContext.db);

    await expect(
      messageCaller.deleteLinkPreviewResponse({ partitionKey: newMessage.partitionKey, rowKey: newMessage.rowKey }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`[TRPCError: UNAUTHORIZED]`);
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

    expect(readMessages.items).toHaveLength(2);
    expect(takeOne(readMessages.items).isPinned).toBeUndefined();
  });

  describe("slowmode guard", () => {
    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(0);
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
      vi.useFakeTimers();
      vi.setSystemTime(0);
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
      await mockContext.db.insert(roomFiltersInMessage).values({ roomId: newRoom.id, words: ["spam"] });

      const createdMessage = await messageCaller.createMessage({
        message: `<p>this is spam</p>`,
        roomId: newRoom.id,
      });

      expect(createdMessage).toBeDefined();
    });

    test("message with blocked word throws FORBIDDEN", async () => {
      expect.hasAssertions();

      const newRoom = await roomCaller.createRoom({ name });
      await mockContext.db.insert(roomFiltersInMessage).values({ roomId: newRoom.id, words: ["spam"] });
      const invite = await roomCaller.createInvite({ expireAfterMinutes: 0, maxUses: 0, roomId: newRoom.id });
      const { user } = await mockSessionOnce(mockContext.db);
      await roomCaller.joinRoom(invite.id);
      await mockSessionOnce(mockContext.db, user);

      await expect(
        messageCaller.createMessage({ message: `<p>this is spam</p>`, roomId: newRoom.id }),
      ).rejects.toThrowErrorMatchingInlineSnapshot(`[TRPCError: Message contains blocked content.]`);
    });

    test("message without blocked word succeeds", async () => {
      expect.hasAssertions();

      const newRoom = await roomCaller.createRoom({ name });
      await mockContext.db.insert(roomFiltersInMessage).values({ roomId: newRoom.id, words: ["spam"] });
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
        .values({ action: WordFilterAction.Timeout, roomId: newRoom.id, timeoutDurationMs, words: ["spam"] });
      const invite = await roomCaller.createInvite({ expireAfterMinutes: 0, maxUses: 0, roomId: newRoom.id });
      const { user } = await mockSessionOnce(mockContext.db);
      await roomCaller.joinRoom(invite.id);
      await mockSessionOnce(mockContext.db, user);
      const beforeCreateMessageTime = Date.now();

      await expect(
        messageCaller.createMessage({ message: `<p>this is spam</p>`, roomId: newRoom.id }),
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

    test("replying to a message auto-follows its thread", async () => {
      expect.hasAssertions();

      const newRoom = await roomCaller.createRoom({ name });
      const userId = getMockSession().user.id;
      const root = await messageCaller.createMessage({ message: getMessage(userId), roomId: newRoom.id });
      await messageCaller.createMessage({ message: getMessage(userId), replyRowKey: root.rowKey, roomId: newRoom.id });

      const { threads } = await messageCaller.readFollowedThreads({ roomId: newRoom.id });

      expect(threads).toHaveLength(1);
      expect(takeOne(threads).rowKey).toBe(root.rowKey);
    });
  });
});
