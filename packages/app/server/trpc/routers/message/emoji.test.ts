import type { Context } from "@@/server/trpc/context";
import type { TRPCRouter } from "@@/server/trpc/routers";
import type { DecorateRouterRecord } from "@trpc/server/unstable-core-do-not-import";

import { rooms } from "#shared/db/schema/rooms";
import { MessageMetadataType } from "#shared/models/db/message/metadata/MessageMetadataType";
import { getMessagesPartitionKey } from "#shared/services/esbabbler/getMessagesPartitionKey";
import { createCallerFactory } from "@@/server/trpc";
import { createMockContext, getMockSession, mockSessionOnce } from "@@/server/trpc/context.test";
import { messageRouter } from "@@/server/trpc/routers/message";
import { emojiRouter } from "@@/server/trpc/routers/message/emoji";
import { roomRouter } from "@@/server/trpc/routers/room";
import { NIL } from "@esposter/shared";
import { MockTableDatabase } from "azure-mock";
import { afterEach, assert, beforeAll, describe, expect, test } from "vitest";

describe("emoji", () => {
  let emojiCaller: DecorateRouterRecord<TRPCRouter["emoji"]>;
  let messageCaller: DecorateRouterRecord<TRPCRouter["message"]>;
  let roomCaller: DecorateRouterRecord<TRPCRouter["room"]>;
  let mockContext: Context;
  const name = "name";
  const message = "message";
  const emojiTag = "emojiTag";

  beforeAll(async () => {
    const createEmojiCaller = createCallerFactory(emojiRouter);
    const createMessageCaller = createCallerFactory(messageRouter);
    const createRoomCaller = createCallerFactory(roomRouter);
    mockContext = await createMockContext();
    emojiCaller = createEmojiCaller(mockContext);
    messageCaller = createMessageCaller(mockContext);
    roomCaller = createRoomCaller(mockContext);
  });

  afterEach(async () => {
    MockTableDatabase.clear();
    await mockContext.db.delete(rooms);
  });

  test("reads empty emojis", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const newMessage = await messageCaller.createMessage({ message, roomId: newRoom.id });
    const readEmojis = await emojiCaller.readEmojis({ messageRowKeys: [newMessage.rowKey], roomId: newRoom.id });

    expect(readEmojis).toHaveLength(0);
  });

  test("reads emojis", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const newMessage = await messageCaller.createMessage({ message, roomId: newRoom.id });
    const partitionKey = getMessagesPartitionKey(newRoom.id, new Date());
    const newEmoji = await emojiCaller.createEmoji({
      emojiTag,
      messageRowKey: newMessage.rowKey,
      partitionKey,
    });

    const readEmojis = await emojiCaller.readEmojis({ messageRowKeys: [newMessage.rowKey], roomId: newRoom.id });

    expect(readEmojis).toHaveLength(1);
    expect(readEmojis[0]).toStrictEqual(newEmoji);
  });

  test("fails read emojis with non-existent room id", async () => {
    expect.hasAssertions();

    await expect(
      emojiCaller.readEmojis({ messageRowKeys: [NIL], roomId: NIL }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: Room is not found for id: 00000000-0000-0000-0000-000000000000]`,
    );
  });

  test("fails read emojis with non-existent member", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const newMessage = await messageCaller.createMessage({ message, roomId: newRoom.id });
    await mockSessionOnce(mockContext.db);

    await expect(
      emojiCaller.readEmojis({ messageRowKeys: [newMessage.rowKey], roomId: newRoom.id }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`[TRPCError: UNAUTHORIZED]`);
  });

  test("creates", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const newMessage = await messageCaller.createMessage({ message, roomId: newRoom.id });
    const partitionKey = getMessagesPartitionKey(newRoom.id, new Date());
    const newEmoji = await emojiCaller.createEmoji({
      emojiTag,
      messageRowKey: newMessage.rowKey,
      partitionKey,
    });

    expect(newEmoji.emojiTag).toBe(emojiTag);
    expect(newEmoji.messageRowKey).toBe(newMessage.rowKey);
    expect(newEmoji.partitionKey).toBe(partitionKey);
    expect(newEmoji.type).toBe(MessageMetadataType.Emoji);
    expect(newEmoji.userIds).toContain(getMockSession().user.id);
  });

  test("fails create with duplicate emoji", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const newMessage = await messageCaller.createMessage({ message, roomId: newRoom.id });
    const partitionKey = getMessagesPartitionKey(newRoom.id, new Date());
    const newEmoji = await emojiCaller.createEmoji({ emojiTag, messageRowKey: newMessage.rowKey, partitionKey });

    await expect(
      emojiCaller.createEmoji({ emojiTag, messageRowKey: newMessage.rowKey, partitionKey }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: Invalid operation: Create, name: Emoji, ${JSON.stringify(newEmoji)}]`,
    );
  });

  test("fails create emoji with non-existent room", async () => {
    expect.hasAssertions();

    const partitionKey = getMessagesPartitionKey(NIL, new Date());

    await expect(
      emojiCaller.createEmoji({
        emojiTag,
        messageRowKey: NIL,
        partitionKey,
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`[TRPCError: Room is not found for id: ${partitionKey}]`);
  });

  test("on creates emoji", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const onCreateEmoji = await emojiCaller.onCreateEmoji({ roomId: newRoom.id });
    const newMessage = await messageCaller.createMessage({ message, roomId: newRoom.id });
    const partitionKey = getMessagesPartitionKey(newRoom.id, new Date());

    const [data] = await Promise.all([
      onCreateEmoji[Symbol.asyncIterator]().next(),
      emojiCaller.createEmoji({
        emojiTag,
        messageRowKey: newMessage.rowKey,
        partitionKey,
      }),
    ]);

    assert(!data.done);

    expect(data.value.emojiTag).toBe(emojiTag);
    expect(data.value.messageRowKey).toBe(newMessage.rowKey);
    expect(data.value.partitionKey).toBe(partitionKey);
  });

  test("fails on creates emoji with non-existent room", async () => {
    expect.hasAssertions();

    await expect(emojiCaller.onCreateEmoji({ roomId: NIL })).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: Room is not found for id: 00000000-0000-0000-0000-000000000000]`,
    );
  });

  test("updates deletes new emoji", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const newMessage = await messageCaller.createMessage({ message, roomId: newRoom.id });
    const partitionKey = getMessagesPartitionKey(newRoom.id, new Date());
    const newEmoji = await emojiCaller.createEmoji({
      emojiTag,
      messageRowKey: newMessage.rowKey,
      partitionKey,
    });

    await emojiCaller.updateEmoji({
      messageRowKey: newEmoji.messageRowKey,
      partitionKey: newEmoji.partitionKey,
      rowKey: newEmoji.rowKey,
    });

    const readEmojis = await emojiCaller.readEmojis({
      messageRowKeys: [newMessage.rowKey],
      roomId: newRoom.id,
    });

    expect(readEmojis).toHaveLength(1);
    expect(readEmojis[0].userIds).toHaveLength(0);
  });

  test("fails update emoji with non-existent room", async () => {
    expect.hasAssertions();

    await expect(
      emojiCaller.updateEmoji({ messageRowKey: NIL, partitionKey: NIL, rowKey: NIL }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: Room is not found for id: 00000000-0000-0000-0000-000000000000]`,
    );
  });

  test("on updates emoji", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const newMessage = await messageCaller.createMessage({ message, roomId: newRoom.id });
    const partitionKey = getMessagesPartitionKey(newRoom.id, new Date());
    const newEmoji = await emojiCaller.createEmoji({
      emojiTag,
      messageRowKey: newMessage.rowKey,
      partitionKey,
    });
    const onUpdateEmoji = await emojiCaller.onUpdateEmoji({ roomId: newRoom.id });
    const [data] = await Promise.all([
      onUpdateEmoji[Symbol.asyncIterator]().next(),
      emojiCaller.updateEmoji({
        messageRowKey: newEmoji.messageRowKey,
        partitionKey: newEmoji.partitionKey,
        rowKey: newEmoji.rowKey,
      }),
    ]);

    assert(!data.done);

    expect(data.value.messageRowKey).toBe(newEmoji.messageRowKey);
    expect(data.value.partitionKey).toBe(newEmoji.partitionKey);
    expect(data.value.rowKey).toBe(newEmoji.rowKey);
    expect(data.value.userIds).toHaveLength(0);
  });

  test("deletes", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const newMessage = await messageCaller.createMessage({ message, roomId: newRoom.id });
    const partitionKey = getMessagesPartitionKey(newRoom.id, new Date());
    const newEmoji = await emojiCaller.createEmoji({
      emojiTag,
      messageRowKey: newMessage.rowKey,
      partitionKey,
    });

    await emojiCaller.deleteEmoji({
      messageRowKey: newEmoji.messageRowKey,
      partitionKey: newEmoji.partitionKey,
      rowKey: newEmoji.rowKey,
    });

    const readEmojis = await emojiCaller.readEmojis({
      messageRowKeys: [newMessage.rowKey],
      roomId: newRoom.id,
    });

    expect(readEmojis).toHaveLength(0);
  });

  test("fails delete emoji with non-existent room", async () => {
    expect.hasAssertions();

    await expect(
      emojiCaller.deleteEmoji({
        messageRowKey: NIL,
        partitionKey: NIL,
        rowKey: NIL,
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: Room is not found for id: 00000000-0000-0000-0000-000000000000]`,
    );
  });

  test("on deletes emoji", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const newMessage = await messageCaller.createMessage({ message, roomId: newRoom.id });
    const partitionKey = getMessagesPartitionKey(newRoom.id, new Date());
    const newEmoji = await emojiCaller.createEmoji({
      emojiTag,
      messageRowKey: newMessage.rowKey,
      partitionKey,
    });

    const onDeleteEmoji = await emojiCaller.onDeleteEmoji({ roomId: newRoom.id });
    const [data] = await Promise.all([
      onDeleteEmoji[Symbol.asyncIterator]().next(),
      emojiCaller.deleteEmoji({
        messageRowKey: newEmoji.messageRowKey,
        partitionKey: newEmoji.partitionKey,
        rowKey: newEmoji.rowKey,
      }),
    ]);

    assert(!data.done);

    expect(data.value.messageRowKey).toBe(newEmoji.messageRowKey);
    expect(data.value.partitionKey).toBe(newEmoji.partitionKey);
    expect(data.value.rowKey).toBe(newEmoji.rowKey);
  });
});
