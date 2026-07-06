import type { Context } from "@@/server/trpc/context";
import type { TRPCRouter } from "@@/server/trpc/routers";
import type { DecorateRouterRecord } from "@trpc/server/unstable-core-do-not-import";

import { createCallerFactory } from "@@/server/trpc";
import { createMockContext, getMockSession, mockSessionOnce } from "@@/server/trpc/context.test";
import { getFirstEmit } from "@@/server/trpc/routers/getFirstEmit.test";
import { messageRouter } from "@@/server/trpc/routers/message";
import { emojiRouter } from "@@/server/trpc/routers/message/emoji";
import { roomRouter } from "@@/server/trpc/routers/room";
import { MessageMetadataType, roomsInMessage } from "@esposter/db-schema";
import { InvalidOperationError, NotFoundError, Operation, takeOne } from "@esposter/shared";
import { MockTableDatabase } from "azure-mock";
import { afterEach, beforeAll, describe, expect, test } from "vitest";

describe("emoji", () => {
  let mockContext: Context;
  let emojiCaller: DecorateRouterRecord<TRPCRouter["message"]["emoji"]>;
  let messageCaller: DecorateRouterRecord<TRPCRouter["message"]>;
  let roomCaller: DecorateRouterRecord<TRPCRouter["room"]>;
  const name = "name";
  const message = "message";
  const emojiTag = "emojiTag";

  beforeAll(async () => {
    mockContext = await createMockContext();
    emojiCaller = createCallerFactory(emojiRouter)(mockContext);
    messageCaller = createCallerFactory(messageRouter)(mockContext);
    roomCaller = createCallerFactory(roomRouter)(mockContext);
  });

  afterEach(async () => {
    MockTableDatabase.clear();
    await mockContext.db.delete(roomsInMessage);
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
    const newEmoji = await emojiCaller.createEmoji({
      emojiTag,
      messageRowKey: newMessage.rowKey,
      partitionKey: newRoom.id,
    });
    const readEmojis = await emojiCaller.readEmojis({ messageRowKeys: [newMessage.rowKey], roomId: newRoom.id });

    expect(readEmojis).toHaveLength(1);
    expect(takeOne(readEmojis)).toStrictEqual(newEmoji);
  });

  test("creates", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const newMessage = await messageCaller.createMessage({ message, roomId: newRoom.id });
    const newEmoji = await emojiCaller.createEmoji({
      emojiTag,
      messageRowKey: newMessage.rowKey,
      partitionKey: newRoom.id,
    });
    const userId = getMockSession().user.id;

    expect(newEmoji.emojiTag).toBe(emojiTag);
    expect(newEmoji.messageRowKey).toBe(newMessage.rowKey);
    expect(newEmoji.partitionKey).toBe(newRoom.id);
    expect(newEmoji.type).toBe(MessageMetadataType.Emoji);
    expect(newEmoji.userIds).toContain(userId);
  });

  test("fails create with duplicate emoji", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const newMessage = await messageCaller.createMessage({ message, roomId: newRoom.id });
    const newEmoji = await emojiCaller.createEmoji({
      emojiTag,
      messageRowKey: newMessage.rowKey,
      partitionKey: newRoom.id,
    });

    await expect(
      emojiCaller.createEmoji({ emojiTag, messageRowKey: newMessage.rowKey, partitionKey: newRoom.id }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new InvalidOperationError(Operation.Create, MessageMetadataType.Emoji, JSON.stringify(newEmoji)).message}]`,
    );
  });

  test("on creates emoji", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const onCreateEmoji = await emojiCaller.onCreateEmoji({ roomId: newRoom.id });
    const newMessage = await messageCaller.createMessage({ message, roomId: newRoom.id });
    const data = await getFirstEmit(
      () => onCreateEmoji,
      () => emojiCaller.createEmoji({ emojiTag, messageRowKey: newMessage.rowKey, partitionKey: newRoom.id }),
    );

    expect(data.emojiTag).toBe(emojiTag);
    expect(data.messageRowKey).toBe(newMessage.rowKey);
    expect(data.partitionKey).toBe(newRoom.id);
  });

  test("updates", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const newMessage = await messageCaller.createMessage({ message, roomId: newRoom.id });
    const newEmoji = await emojiCaller.createEmoji({
      emojiTag,
      messageRowKey: newMessage.rowKey,
      partitionKey: newRoom.id,
    });
    const newInviteCode = await roomCaller.createInvite({ roomId: newRoom.id });
    const { user } = await mockSessionOnce(mockContext.db);
    await roomCaller.joinRoom(newInviteCode);
    await mockSessionOnce(mockContext.db, user);
    await emojiCaller.updateEmoji({
      messageRowKey: newEmoji.messageRowKey,
      partitionKey: newEmoji.partitionKey,
      rowKey: newEmoji.rowKey,
    });
    const readEmojis = await emojiCaller.readEmojis({ messageRowKeys: [newMessage.rowKey], roomId: newRoom.id });
    const userId = getMockSession().user.id;

    expect(readEmojis).toHaveLength(1);
    expect(takeOne(readEmojis).userIds).toStrictEqual([userId, user.id]);
  });

  test("updates twice removes user id", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const newMessage = await messageCaller.createMessage({ message, roomId: newRoom.id });
    const newEmoji = await emojiCaller.createEmoji({
      emojiTag,
      messageRowKey: newMessage.rowKey,
      partitionKey: newRoom.id,
    });
    const newInviteCode = await roomCaller.createInvite({ roomId: newRoom.id });
    const { user } = await mockSessionOnce(mockContext.db);
    await roomCaller.joinRoom(newInviteCode);
    await mockSessionOnce(mockContext.db, user);
    await emojiCaller.updateEmoji({
      messageRowKey: newEmoji.messageRowKey,
      partitionKey: newEmoji.partitionKey,
      rowKey: newEmoji.rowKey,
    });
    await mockSessionOnce(mockContext.db, user);
    await emojiCaller.updateEmoji({
      messageRowKey: newEmoji.messageRowKey,
      partitionKey: newEmoji.partitionKey,
      rowKey: newEmoji.rowKey,
    });
    const readEmojis = await emojiCaller.readEmojis({ messageRowKeys: [newMessage.rowKey], roomId: newRoom.id });
    const userId = getMockSession().user.id;

    expect(readEmojis).toHaveLength(1);
    expect(takeOne(readEmojis).userIds).toStrictEqual([userId]);
  });

  test("fails update emoji with non-existent emoji", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const input = { messageRowKey: "", partitionKey: newRoom.id, rowKey: "" };

    await expect(emojiCaller.updateEmoji(input)).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new NotFoundError(MessageMetadataType.Emoji, JSON.stringify(input)).message}]`,
    );
  });

  test("deletes", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const newMessage = await messageCaller.createMessage({ message, roomId: newRoom.id });
    const newEmoji = await emojiCaller.createEmoji({
      emojiTag,
      messageRowKey: newMessage.rowKey,
      partitionKey: newRoom.id,
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
});
