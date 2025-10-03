import type { Context } from "@@/server/trpc/context";
import type { TRPCRouter } from "@@/server/trpc/routers";
import type { DecorateRouterRecord } from "@trpc/server/unstable-core-do-not-import";

import { rooms } from "#shared/db/schema/rooms";
import { AzureContainer } from "#shared/models/azure/blob/AzureContainer";
import { MessageType } from "#shared/models/db/message/MessageType";
import { SortOrder } from "#shared/models/pagination/sorting/SortOrder";
import { getReverseTickedTimestamp } from "#shared/services/azure/table/getReverseTickedTimestamp";
import { MENTION_ID_ATTRIBUTE, MENTION_TYPE, MENTION_TYPE_ATTRIBUTE } from "#shared/services/message/constants";
import { MESSAGE_ROWKEY_SORT_ITEM } from "#shared/services/pagination/constants";
import { serialize } from "#shared/services/pagination/cursor/serialize";
import { getBlobName } from "@@/server/services/azure/container/getBlobName";
import { getCursorPaginationData } from "@@/server/services/pagination/cursor/getCursorPaginationData";
import { createCallerFactory } from "@@/server/trpc";
import { createMockContext, getMockSession, mockSessionOnce } from "@@/server/trpc/context.test";
import { messageRouter } from "@@/server/trpc/routers/message";
import { roomRouter } from "@@/server/trpc/routers/room";
import { MockContainerDatabase, MockTableDatabase } from "azure-mock";
import { afterEach, assert, beforeAll, describe, expect, test } from "vitest";

describe("message", () => {
  let messageCaller: DecorateRouterRecord<TRPCRouter["message"]>;
  let roomCaller: DecorateRouterRecord<TRPCRouter["room"]>;
  let mockContext: Context;
  const filename = "filename";
  const mimetype = "image/jpeg";
  const size = 1000;
  const name = "name";
  const getMessage = (userId: string) =>
    `<span ${MENTION_TYPE_ATTRIBUTE}="${MENTION_TYPE}" ${MENTION_ID_ATTRIBUTE}="${userId}" />`;
  const updatedMessage = "updatedMessage";
  const rowKey = "rowKey";

  beforeAll(async () => {
    const createMessageCaller = createCallerFactory(messageRouter);
    const createRoomCaller = createCallerFactory(roomRouter);
    mockContext = await createMockContext();
    messageCaller = createMessageCaller(mockContext);
    roomCaller = createRoomCaller(mockContext);
  });

  afterEach(async () => {
    MockContainerDatabase.clear();
    MockTableDatabase.clear();
    await mockContext.db.delete(rooms);
  });

  test("reads empty messages", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const readMessages = await messageCaller.readMessages({ roomId: newRoom.id });

    expect(readMessages).toStrictEqual(getCursorPaginationData([], 0, []));
  });

  test("reads messages", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const message = getMessage(getMockSession().user.id);
    const newMessage = await messageCaller.createMessage({ message, roomId: newRoom.id });
    const readMessages = await messageCaller.readMessages({ roomId: newRoom.id });

    expect(readMessages.items).toHaveLength(1);
    expect(readMessages.items[0].message).toBe(newMessage.message);
  });

  test("reads messages with cursor and includes value", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const message = getMessage(getMockSession().user.id);
    const firstMessage = await messageCaller.createMessage({ message, roomId: newRoom.id });
    const secondMessage = await messageCaller.createMessage({ message, roomId: newRoom.id });
    const cursor = serialize({ rowKey: secondMessage.rowKey }, [MESSAGE_ROWKEY_SORT_ITEM]);
    let readMessages = await messageCaller.readMessages({ cursor, roomId: newRoom.id });

    expect(readMessages.items).toHaveLength(1);
    expect(readMessages.items[0].rowKey).toBe(firstMessage.rowKey);

    readMessages = await messageCaller.readMessages({
      cursor,
      isIncludeValue: true,
      roomId: newRoom.id,
    });

    expect(readMessages.items).toHaveLength(2);
    expect(readMessages.items[0].rowKey).toBe(firstMessage.rowKey);
    expect(readMessages.items[1].rowKey).toBe(secondMessage.rowKey);
  });

  test("reads messages in ascending order with cursor and includes value", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const message = getMessage(getMockSession().user.id);
    const firstMessage = await messageCaller.createMessage({ message, roomId: newRoom.id });
    const secondMessage = await messageCaller.createMessage({ message, roomId: newRoom.id });
    // Limit 1 should return oldest first
    let readMessages = await messageCaller.readMessages({ limit: 1, order: SortOrder.Asc, roomId: newRoom.id });

    expect(readMessages.items).toHaveLength(1);
    expect(readMessages.items[0].rowKey).toBe(firstMessage.rowKey);

    let cursor = serialize({ rowKey: getReverseTickedTimestamp(firstMessage.rowKey) }, [MESSAGE_ROWKEY_SORT_ITEM]);
    readMessages = await messageCaller.readMessages({
      cursor,
      order: SortOrder.Asc,
      roomId: newRoom.id,
    });

    expect(readMessages.items).toHaveLength(1);
    expect(readMessages.items[0].rowKey).toBe(secondMessage.rowKey);

    cursor = serialize({ rowKey: getReverseTickedTimestamp(firstMessage.rowKey) }, [MESSAGE_ROWKEY_SORT_ITEM]);
    readMessages = await messageCaller.readMessages({
      cursor,
      isIncludeValue: true,
      order: SortOrder.Asc,
      roomId: newRoom.id,
    });

    expect(readMessages.items).toHaveLength(2);
    expect(readMessages.items[0].rowKey).toBe(firstMessage.rowKey);
    expect(readMessages.items[1].rowKey).toBe(secondMessage.rowKey);
  });

  test("fails read messages with non-existent room id", async () => {
    expect.hasAssertions();

    const roomId = crypto.randomUUID();

    await expect(messageCaller.readMessages({ roomId })).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: UNAUTHORIZED]`,
    );
  });

  test("fails read messages with non-existent member", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    await mockSessionOnce(mockContext.db);

    await expect(messageCaller.readMessages({ roomId: newRoom.id })).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: UNAUTHORIZED]`,
    );
  });

  test("reads messages by row keys", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const message = getMessage(getMockSession().user.id);
    const newMessage = await messageCaller.createMessage({ message, roomId: newRoom.id });
    const readMessages = await messageCaller.readMessagesByRowKeys({
      roomId: newRoom.id,
      rowKeys: [newMessage.rowKey],
    });

    expect(readMessages).toHaveLength(1);
    expect(readMessages[0].message).toBe(message);
  });

  test("fails read messages by row keys with non-existent room id", async () => {
    expect.hasAssertions();

    const roomId = crypto.randomUUID();

    await expect(
      messageCaller.readMessagesByRowKeys({ roomId, rowKeys: [""] }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`[TRPCError: UNAUTHORIZED]`);
  });

  test("fails read messages by row keys with non-existent member", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const message = getMessage(getMockSession().user.id);
    const newMessage = await messageCaller.createMessage({ message, roomId: newRoom.id });
    await mockSessionOnce(mockContext.db);

    await expect(
      messageCaller.readMessagesByRowKeys({ roomId: newRoom.id, rowKeys: [newMessage.rowKey] }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`[TRPCError: UNAUTHORIZED]`);
  });

  test("creates", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const userId = getMockSession().user.id;
    const message = getMessage(userId);
    const newMessage = await messageCaller.createMessage({ message, roomId: newRoom.id });

    expect(newMessage.mentions).toHaveLength(1);
    expect(newMessage.mentions[0]).toBe(userId);
    expect(newMessage.message).toBe(message);
    expect(newMessage.type).toBe(MessageType.Message);
    expect(newMessage.userId).toBe(userId);
  });

  test("fails create with non-existent room id", async () => {
    expect.hasAssertions();

    const roomId = crypto.randomUUID();
    const message = getMessage(getMockSession().user.id);

    await expect(messageCaller.createMessage({ message, roomId })).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: UNAUTHORIZED]`,
    );
  });

  test("fails create with non-existent member", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const { user } = await mockSessionOnce(mockContext.db);
    const message = getMessage(user.id);

    await expect(
      messageCaller.createMessage({ message, roomId: newRoom.id }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`[TRPCError: UNAUTHORIZED]`);
  });

  test.todo("on creates", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const newInviteCode = await roomCaller.createInvite({ roomId: newRoom.id });
    const { user } = await mockSessionOnce(mockContext.db);
    await roomCaller.joinRoom(newInviteCode);
    const onCreateMessage = await messageCaller.onCreateMessage({ roomId: newRoom.id });
    const message = getMessage(user.id);
    await mockSessionOnce(mockContext.db, user);
    const [data, newMessage] = await Promise.all([
      onCreateMessage[Symbol.asyncIterator]().next(),
      messageCaller.createMessage({ message, roomId: newRoom.id }),
    ]);

    assert(!data.done);

    expect(data.value.id).toBe(newMessage.rowKey);
    expect(data.value.data).toHaveLength(1);
    expect(data.value.data[0].message).toBe(message);
  });

  test("fails on creates with non-existent room", async () => {
    expect.hasAssertions();

    const roomId = crypto.randomUUID();

    await expect(messageCaller.onCreateMessage({ roomId })).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: UNAUTHORIZED]`,
    );
  });

  test("fails on creates with non-existent member", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    await mockSessionOnce(mockContext.db);

    await expect(messageCaller.onCreateMessage({ roomId: newRoom.id })).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: UNAUTHORIZED]`,
    );
  });

  test("creates typing", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const mockSession = getMockSession();
    await messageCaller.createTyping({
      roomId: newRoom.id,
      userId: mockSession.user.id,
      username: mockSession.user.name,
    });

    // createTyping is a query that emits events, so we just verify it doesn't throw
    expect(true).toBe(true);
  });

  test("fails create typing with non-existent room id", async () => {
    expect.hasAssertions();

    const mockSession = getMockSession();

    const roomId = crypto.randomUUID();

    await expect(
      messageCaller.createTyping({ roomId, userId: mockSession.user.id, username: mockSession.user.name }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`[TRPCError: UNAUTHORIZED]`);
  });

  test("fails create typing with non-existent member", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const mockSession = getMockSession();
    await mockSessionOnce(mockContext.db);

    await expect(
      messageCaller.createTyping({ roomId: newRoom.id, userId: mockSession.user.id, username: mockSession.user.name }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`[TRPCError: UNAUTHORIZED]`);
  });

  test("on creates typing", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const onCreateTyping = await messageCaller.onCreateTyping({ roomId: newRoom.id });
    const mockSession = getMockSession();
    const [data] = await Promise.all([
      onCreateTyping[Symbol.asyncIterator]().next(),
      messageCaller.createTyping({ roomId: newRoom.id, userId: mockSession.user.id, username: mockSession.user.name }),
    ]);

    assert(!data.done);

    expect(data.value.roomId).toBe(newRoom.id);
  });

  test("fails on creates typing with non-existent room", async () => {
    expect.hasAssertions();

    const roomId = crypto.randomUUID();

    await expect(messageCaller.onCreateTyping({ roomId })).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: UNAUTHORIZED]`,
    );
  });

  test("fails on creates typing with non-existent member", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    await mockSessionOnce(mockContext.db);

    await expect(messageCaller.onCreateTyping({ roomId: newRoom.id })).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: UNAUTHORIZED]`,
    );
  });

  test("updates", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const message = getMessage(getMockSession().user.id);
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
    expect(readMessages.items[0].isEdited).toBe(true);
    expect(readMessages.items[0].mentions).toHaveLength(0);
    expect(readMessages.items[0].message).toBe(updatedMessage);
  });

  test("fails update with non-existent message", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });

    await expect(
      messageCaller.updateMessage({ message: updatedMessage, partitionKey: newRoom.id, rowKey }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: Message is not found for id: {"message":"updatedMessage","partitionKey":"${newRoom.id}","rowKey":"rowKey"}]`,
    );
  });

  test("fails update with wrong user", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const message = getMessage(getMockSession().user.id);
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
    const message = getMessage(getMockSession().user.id);
    const newMessage = await messageCaller.createMessage({ message, roomId: newRoom.id });
    const onUpdateMessage = await messageCaller.onUpdateMessage({ roomId: newRoom.id });
    const [data] = await Promise.all([
      onUpdateMessage[Symbol.asyncIterator]().next(),
      messageCaller.updateMessage({
        message: updatedMessage,
        partitionKey: newMessage.partitionKey,
        rowKey: newMessage.rowKey,
      }),
    ]);

    assert(!data.done);

    expect(data.value.message).toBe(updatedMessage);
  });

  test("fails on updates with non-existent room", async () => {
    expect.hasAssertions();

    const roomId = crypto.randomUUID();

    await expect(messageCaller.onUpdateMessage({ roomId })).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: UNAUTHORIZED]`,
    );
  });

  test("fails on updates with non-existent member", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    await mockSessionOnce(mockContext.db);

    await expect(messageCaller.onUpdateMessage({ roomId: newRoom.id })).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: UNAUTHORIZED]`,
    );
  });

  test("deletes", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const message = getMessage(getMockSession().user.id);
    const newMessage = await messageCaller.createMessage({ message, roomId: newRoom.id });
    await messageCaller.deleteMessage({ partitionKey: newMessage.partitionKey, rowKey: newMessage.rowKey });

    const readMessages = await messageCaller.readMessages({ roomId: newRoom.id });

    expect(readMessages.items).toHaveLength(0);
  });

  test("fails delete with non-existent message", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });

    await expect(
      messageCaller.deleteMessage({ partitionKey: newRoom.id, rowKey }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: Message is not found for id: {"partitionKey":"${newRoom.id}","rowKey":"rowKey"}]`,
    );
  });

  test("fails delete with wrong user", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const message = getMessage(getMockSession().user.id);
    const newMessage = await messageCaller.createMessage({ message, roomId: newRoom.id });
    await mockSessionOnce(mockContext.db);

    await expect(
      messageCaller.deleteMessage({ partitionKey: newMessage.partitionKey, rowKey: newMessage.rowKey }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`[TRPCError: UNAUTHORIZED]`);
  });

  test("on deletes", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const message = getMessage(getMockSession().user.id);
    const newMessage = await messageCaller.createMessage({ message, roomId: newRoom.id });
    const onDeleteMessage = await messageCaller.onDeleteMessage({ roomId: newRoom.id });
    const [data] = await Promise.all([
      onDeleteMessage[Symbol.asyncIterator]().next(),
      messageCaller.deleteMessage({
        partitionKey: newMessage.partitionKey,
        rowKey: newMessage.rowKey,
      }),
    ]);

    assert(!data.done);

    expect(data.value.partitionKey).toBe(newMessage.partitionKey);
    expect(data.value.rowKey).toBe(newMessage.rowKey);
  });

  test("fails on deletes with non-existent room", async () => {
    expect.hasAssertions();

    const roomId = crypto.randomUUID();

    await expect(messageCaller.onDeleteMessage({ roomId })).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: UNAUTHORIZED]`,
    );
  });

  test("fails on deletes with non-existent member", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    await mockSessionOnce(mockContext.db);

    await expect(messageCaller.onDeleteMessage({ roomId: newRoom.id })).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: UNAUTHORIZED]`,
    );
  });

  test("forwards message", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const message = getMessage(getMockSession().user.id);
    const newMessage = await messageCaller.createMessage({ message, roomId: newRoom.id });
    const targetRoom = await roomCaller.createRoom({ name });

    await messageCaller.forwardMessage({
      partitionKey: newMessage.partitionKey,
      roomIds: [targetRoom.id],
      rowKey: newMessage.rowKey,
    });

    const targetMessages = await messageCaller.readMessages({ roomId: targetRoom.id });

    expect(targetMessages.items).toHaveLength(1);
    expect(targetMessages.items[0].isForward).toBe(true);
  });

  test("forwards message with optional message", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const message = getMessage(getMockSession().user.id);
    const newMessage = await messageCaller.createMessage({ message, roomId: newRoom.id });
    const targetRoom = await roomCaller.createRoom({ name });

    await messageCaller.forwardMessage({
      message,
      partitionKey: newMessage.partitionKey,
      roomIds: [targetRoom.id],
      rowKey: newMessage.rowKey,
    });

    const targetMessages = await messageCaller.readMessages({ roomId: targetRoom.id });

    expect(targetMessages.items).toHaveLength(2);
    expect(targetMessages.items[0].isForward).toBe(true);
    expect(targetMessages.items[1].isForward).toBeUndefined();
  });

  test("fails forward messages with non-existent message", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });

    await expect(
      messageCaller.forwardMessage({ partitionKey: newRoom.id, roomIds: [newRoom.id], rowKey }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: Message is not found for id: {"partitionKey":"${newRoom.id}","rowKey":"${rowKey}"}]`,
    );
  });

  test("fails forward messages with non-member room", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const message = getMessage(getMockSession().user.id);
    const newMessage = await messageCaller.createMessage({ message, roomId: newRoom.id });
    const targetRoom = await roomCaller.createRoom({ name });
    await mockSessionOnce(mockContext.db);

    await expect(
      messageCaller.forwardMessage({
        partitionKey: newMessage.partitionKey,
        roomIds: [targetRoom.id],
        rowKey: newMessage.rowKey,
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`[TRPCError: UNAUTHORIZED]`);
  });

  test("fails forward messages with non-existent room", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const message = getMessage(getMockSession().user.id);
    const newMessage = await messageCaller.createMessage({ message, roomId: newRoom.id });

    await expect(
      messageCaller.forwardMessage({
        partitionKey: newMessage.partitionKey,
        roomIds: [crypto.randomUUID()],
        rowKey: newMessage.rowKey,
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`[TRPCError: UNAUTHORIZED]`);
  });

  test("generates upload file SAS entities", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const sasEntities = await messageCaller.generateUploadFileSasEntities({
      files: [{ filename, mimetype }],
      roomId: newRoom.id,
    });

    expect(sasEntities).toHaveLength(1);
  });

  test("fails generate upload file SAS entities with non-existent room id", async () => {
    expect.hasAssertions();

    const roomId = crypto.randomUUID();

    await expect(
      messageCaller.generateUploadFileSasEntities({ files: [{ filename, mimetype }], roomId }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`[TRPCError: UNAUTHORIZED]`);
  });

  test("fails generate upload file SAS entities with non-existent member", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    await mockSessionOnce(mockContext.db);

    await expect(
      messageCaller.generateUploadFileSasEntities({ files: [{ filename, mimetype }], roomId: newRoom.id }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`[TRPCError: UNAUTHORIZED]`);
  });

  test("generates download file SAS URLs", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const files = [{ filename, id: crypto.randomUUID(), mimetype }];
    const sasUrls = await messageCaller.generateDownloadFileSasUrls({ files, roomId: newRoom.id });

    expect(sasUrls).toHaveLength(1);
  });

  test("fails generate download file SAS URLs with non-existent room id", async () => {
    expect.hasAssertions();

    const roomId = crypto.randomUUID();

    await expect(
      messageCaller.generateDownloadFileSasUrls({
        files: [{ filename, id: crypto.randomUUID(), mimetype }],
        roomId,
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`[TRPCError: UNAUTHORIZED]`);
  });

  test("fails generate download file SAS URLs with non-existent member", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    await mockSessionOnce(mockContext.db);

    await expect(
      messageCaller.generateDownloadFileSasUrls({
        files: [{ filename, id: crypto.randomUUID(), mimetype }],
        roomId: newRoom.id,
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`[TRPCError: UNAUTHORIZED]`);
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

    const updatedMessage = await messageCaller.readMessagesByRowKeys({
      roomId: newRoom.id,
      rowKeys: [newMessage.rowKey],
    });

    expect(updatedMessage[0].files).toHaveLength(0);
  });

  test("fails delete file with non-existent message", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const id = crypto.randomUUID();

    await expect(
      messageCaller.deleteFile({ id, partitionKey: newRoom.id, rowKey }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: Message is not found for id: {"partitionKey":"${newRoom.id}","rowKey":"rowKey","id":"${id}"}]`,
    );
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
    ).rejects.toThrowErrorMatchingInlineSnapshot(`[TRPCError: File is not found for id: ${deleteFileId}]`);
  });

  test.todo("fails delete file with forward", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const id = crypto.randomUUID();
    const message = getMessage(getMockSession().user.id);
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
    const [data] = await Promise.all([
      onCreateMessage[Symbol.asyncIterator]().next(),
      messageCaller.forwardMessage({
        partitionKey: newMessage.partitionKey,
        roomIds: [newRoom.id],
        rowKey: newMessage.rowKey,
      }),
    ]);

    assert(!data.done);

    await expect(
      messageCaller.deleteFile({
        id,
        partitionKey: data.value.data[0].partitionKey,
        rowKey: data.value.data[0].rowKey,
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`[TRPCError: File is not found for id: ${id}]`);
  });

  test("fails delete file with message without files", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const message = getMessage(getMockSession().user.id);
    const newMessage = await messageCaller.createMessage({ message, roomId: newRoom.id });

    await expect(
      messageCaller.deleteFile({
        id: crypto.randomUUID(),
        partitionKey: newMessage.partitionKey,
        rowKey: newMessage.rowKey,
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`[TRPCError: BAD_REQUEST]`);
  });

  test("deletes link preview response", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const message = getMessage(getMockSession().user.id);
    const newMessage = await messageCaller.createMessage({ message, roomId: newRoom.id });

    await messageCaller.deleteLinkPreviewResponse({
      partitionKey: newMessage.partitionKey,
      rowKey: newMessage.rowKey,
    });

    const updatedMessage = await messageCaller.readMessagesByRowKeys({
      roomId: newRoom.id,
      rowKeys: [newMessage.rowKey],
    });

    expect(updatedMessage[0].linkPreviewResponse).toBeNull();
  });

  test("fails delete link preview response with non-existent message", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });

    await expect(
      messageCaller.deleteLinkPreviewResponse({ partitionKey: newRoom.id, rowKey }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: Message is not found for id: {"partitionKey":"${newRoom.id}","rowKey":"rowKey"}]`,
    );
  });

  test("fails delete link preview response with wrong user", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const message = getMessage(getMockSession().user.id);
    const newMessage = await messageCaller.createMessage({ message, roomId: newRoom.id });
    await mockSessionOnce(mockContext.db);

    await expect(
      messageCaller.deleteLinkPreviewResponse({ partitionKey: newMessage.partitionKey, rowKey: newMessage.rowKey }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`[TRPCError: UNAUTHORIZED]`);
  });

  test("pins message and creates system message", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const message = getMessage(getMockSession().user.id);
    const newMessage = await messageCaller.createMessage({ message, roomId: newRoom.id });

    await messageCaller.pinMessage({ partitionKey: newMessage.partitionKey, rowKey: newMessage.rowKey });

    const readMessages = await messageCaller.readMessages({ roomId: newRoom.id });

    expect(readMessages.items).toHaveLength(2);
    expect(readMessages.items[0].partitionKey).toBe(newMessage.partitionKey);
    expect(readMessages.items[0].rowKey).toBe(newMessage.rowKey);
    expect(readMessages.items[0].isPinned).toBe(true);
    expect(readMessages.items[1].type).toBe(MessageType.PinMessage);
    expect(readMessages.items[1].replyRowKey).toBe(newMessage.rowKey);
  });

  test("unpins message", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const message = getMessage(getMockSession().user.id);
    const newMessage = await messageCaller.createMessage({ message, roomId: newRoom.id });

    await messageCaller.pinMessage({ partitionKey: newMessage.partitionKey, rowKey: newMessage.rowKey });
    await messageCaller.unpinMessage({ partitionKey: newMessage.partitionKey, rowKey: newMessage.rowKey });

    const readMessages = await messageCaller.readMessages({ roomId: newRoom.id });

    expect(readMessages.items).toHaveLength(2);
    expect(readMessages.items[0].isPinned).toBeUndefined();
  });
});
