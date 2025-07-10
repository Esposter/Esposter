import type { Context } from "@@/server/trpc/context";
import type { TRPCRouter } from "@@/server/trpc/routers";
import type { DecorateRouterRecord } from "@trpc/server/unstable-core-do-not-import";

import { rooms } from "#shared/db/schema/rooms";
import { AzureContainer } from "#shared/models/azure/blob/AzureContainer";
import { getMessagesPartitionKey } from "#shared/services/esbabbler/getMessagesPartitionKey";
import { getBlobName } from "@@/server/services/azure/container/getBlobName";
import { getCursorPaginationData } from "@@/server/services/pagination/cursor/getCursorPaginationData";
import { createCallerFactory } from "@@/server/trpc";
import { createMockContext, getMockSession, mockSessionOnce } from "@@/server/trpc/context.test";
import { messageRouter } from "@@/server/trpc/routers/message";
import { roomRouter } from "@@/server/trpc/routers/room";
import { NIL } from "@esposter/shared";
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
  const message = "message";
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
    const newMessage = await messageCaller.createMessage({ message, roomId: newRoom.id });
    const readMessages = await messageCaller.readMessages({ roomId: newRoom.id });

    expect(readMessages.items).toHaveLength(1);
    expect(readMessages.items[0].message).toBe(newMessage.message);
  });

  test("fails read messages with non-existent room id", async () => {
    expect.hasAssertions();

    await expect(messageCaller.readMessages({ roomId: NIL })).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: Room is not found for id: 00000000-0000-0000-0000-000000000000]`,
    );
  });

  test("reads messages by row keys", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
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

    await expect(
      messageCaller.readMessagesByRowKeys({ roomId: NIL, rowKeys: [NIL] }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: Room is not found for id: 00000000-0000-0000-0000-000000000000]`,
    );
  });

  test("creates", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const newMessage = await messageCaller.createMessage({ message, roomId: newRoom.id });

    expect(newMessage.message).toBe(message);
  });

  test("fails create with non-existent room id", async () => {
    expect.hasAssertions();

    await expect(messageCaller.createMessage({ message, roomId: NIL })).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: Room is not found for id: 00000000-0000-0000-0000-000000000000]`,
    );
  });

  test.todo("on creates", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const inviteCode = await roomCaller.createInvite({ roomId: newRoom.id });
    const { user } = await mockSessionOnce(mockContext.db);
    await roomCaller.joinRoom(inviteCode);
    const onCreateMessage = await messageCaller.onCreateMessage({ roomId: newRoom.id });
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

    await expect(
      messageCaller.createTyping({ roomId: NIL, userId: mockSession.user.id, username: mockSession.user.name }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: Room is not found for id: 00000000-0000-0000-0000-000000000000]`,
    );
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

  test("updates", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const newMessage = await messageCaller.createMessage({ message, roomId: newRoom.id });
    await messageCaller.updateMessage({
      message: updatedMessage,
      partitionKey: newMessage.partitionKey,
      rowKey: newMessage.rowKey,
    });
    const readMessages = await messageCaller.readMessages({ roomId: newRoom.id });

    expect(readMessages.items).toHaveLength(1);
    expect(readMessages.items[0].message).toBe(updatedMessage);
  });

  test("fails update with non-existent message", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const partitionKey = getMessagesPartitionKey(newRoom.id, new Date());

    await expect(
      messageCaller.updateMessage({ message: updatedMessage, partitionKey, rowKey }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: Message is not found for id: {"files":[],"message":"updatedMessage","partitionKey":"${partitionKey}","rowKey":"rowKey"}]`,
    );
  });

  test("fails update with wrong user", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
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

  test("deletes", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const newMessage = await messageCaller.createMessage({ message, roomId: newRoom.id });
    await messageCaller.deleteMessage({ partitionKey: newMessage.partitionKey, rowKey: newMessage.rowKey });

    const readMessages = await messageCaller.readMessages({ roomId: newRoom.id });

    expect(readMessages.items).toHaveLength(0);
  });

  test("fails delete with non-existent message", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const partitionKey = getMessagesPartitionKey(newRoom.id, new Date());

    await expect(messageCaller.deleteMessage({ partitionKey, rowKey })).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: Message is not found for id: {"partitionKey":"${partitionKey}","rowKey":"rowKey"}]`,
    );
  });

  test("fails delete with wrong user", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const newMessage = await messageCaller.createMessage({ message, roomId: newRoom.id });
    await mockSessionOnce(mockContext.db);

    await expect(
      messageCaller.deleteMessage({ partitionKey: newMessage.partitionKey, rowKey: newMessage.rowKey }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`[TRPCError: UNAUTHORIZED]`);
  });

  test("on deletes", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
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

  test("forwards message", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const newMessage = await messageCaller.createMessage({ message, roomId: newRoom.id });
    const targetRoom = await roomCaller.createRoom({ name });

    await messageCaller.forwardMessages({
      partitionKey: newMessage.partitionKey,
      roomIds: [targetRoom.id],
      rowKey: newMessage.rowKey,
    });

    const targetMessages = await messageCaller.readMessages({ roomId: targetRoom.id });

    expect(targetMessages.items).toHaveLength(2);
    expect(targetMessages.items[0].isForward).toBeUndefined();
    expect(targetMessages.items[1].isForward).toBe(true);
  });

  test("forwards message with optional message", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const newMessage = await messageCaller.createMessage({ message, roomId: newRoom.id });
    const targetRoom = await roomCaller.createRoom({ name });

    await messageCaller.forwardMessages({
      message,
      partitionKey: newMessage.partitionKey,
      roomIds: [targetRoom.id],
      rowKey: newMessage.rowKey,
    });

    const targetMessages = await messageCaller.readMessages({ roomId: targetRoom.id });

    expect(targetMessages.items).toHaveLength(3);
    expect(targetMessages.items[0].isForward).toBeUndefined();
    expect(targetMessages.items[1].isForward).toBe(true);
    expect(targetMessages.items[2].isForward).toBeUndefined();
  });

  test("fails forward messages with non-existent message", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const partitionKey = getMessagesPartitionKey(newRoom.id, new Date());

    await expect(
      messageCaller.forwardMessages({ partitionKey, roomIds: [newRoom.id], rowKey }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: Message is not found for id: {"partitionKey":"${partitionKey}","rowKey":"rowKey"}]`,
    );
  });

  test("fails forward messages with non-member room", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const newMessage = await messageCaller.createMessage({ message, roomId: newRoom.id });
    const targetRoom = await roomCaller.createRoom({ name });
    await mockSessionOnce(mockContext.db);

    await expect(
      messageCaller.forwardMessages({
        partitionKey: newMessage.partitionKey,
        roomIds: [targetRoom.id],
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

    await expect(
      messageCaller.generateUploadFileSasEntities({ files: [{ filename, mimetype }], roomId: NIL }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: Room is not found for id: 00000000-0000-0000-0000-000000000000]`,
    );
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

    await expect(
      messageCaller.generateDownloadFileSasUrls({
        files: [{ filename, id: crypto.randomUUID(), mimetype }],
        roomId: NIL,
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: Room is not found for id: 00000000-0000-0000-0000-000000000000]`,
    );
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
      AzureContainer.EsbabblerAssets,
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
    const partitionKey = getMessagesPartitionKey(newRoom.id, new Date());
    const id = crypto.randomUUID();

    await expect(messageCaller.deleteFile({ id, partitionKey, rowKey })).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: Message is not found for id: {"partitionKey":"${partitionKey}","rowKey":"rowKey","id":"${id}"}]`,
    );
  });

  test("fails delete file with wrong user", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const newMessage = await messageCaller.createMessage({
      files: [{ filename, id: crypto.randomUUID(), mimetype, size }],
      roomId: newRoom.id,
    });
    await mockSessionOnce(mockContext.db);

    await expect(
      messageCaller.deleteFile({
        id: crypto.randomUUID(),
        partitionKey: newMessage.partitionKey,
        rowKey: newMessage.rowKey,
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`[TRPCError: UNAUTHORIZED]`);
  });

  test("fails delete file with non-existent file id", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const newMessage = await messageCaller.createMessage({
      files: [{ filename, id: crypto.randomUUID(), mimetype, size }],
      roomId: newRoom.id,
    });

    await expect(
      messageCaller.deleteFile({ id: NIL, partitionKey: newMessage.partitionKey, rowKey: newMessage.rowKey }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: File is not found for id: 00000000-0000-0000-0000-000000000000]`,
    );
  });

  test("fails delete file with forward", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const newMessage = await messageCaller.createMessage({
      files: [{ filename, id: crypto.randomUUID(), mimetype, size }],
      message,
      roomId: newRoom.id,
    });
    const id = crypto.randomUUID();

    await expect(
      messageCaller.deleteFile({ id, partitionKey: newMessage.partitionKey, rowKey: newMessage.rowKey }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`[TRPCError: File is not found for id: ${id}]`);
  });

  test("fails delete file with message without files", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
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
    const partitionKey = getMessagesPartitionKey(newRoom.id, new Date());

    await expect(
      messageCaller.deleteLinkPreviewResponse({ partitionKey, rowKey }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: Message is not found for id: {"partitionKey":"${partitionKey}","rowKey":"rowKey"}]`,
    );
  });

  test("fails delete link preview response with wrong user", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const newMessage = await messageCaller.createMessage({ message, roomId: newRoom.id });
    await mockSessionOnce(mockContext.db);

    await expect(
      messageCaller.deleteLinkPreviewResponse({ partitionKey: newMessage.partitionKey, rowKey: newMessage.rowKey }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`[TRPCError: UNAUTHORIZED]`);
  });
});
