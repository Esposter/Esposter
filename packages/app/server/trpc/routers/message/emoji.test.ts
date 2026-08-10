import type { Context } from "@@/server/trpc/context";
import type { TRPCRouter } from "@@/server/trpc/routers";
import type { DecorateRouterRecord } from "@trpc/server/unstable-core-do-not-import";

import { createCallerFactory } from "@@/server/trpc";
import { getMockSession, mockSessionOnce } from "@@/server/trpc/context.test";
import { getFirstEmit } from "@@/server/trpc/routers/getFirstEmit.test";
import { messageRouter } from "@@/server/trpc/routers/message";
import { emojiRouter } from "@@/server/trpc/routers/message/emoji";
import { setupRoomSuite } from "@@/server/trpc/routers/setupRoomSuite.test";
import { MessageMetadataType } from "@esposter/db-schema";
import { InvalidOperationError, NotFoundError, Operation, takeOne } from "@esposter/shared";
import { beforeAll, beforeEach, describe, expect, test } from "vitest";

describe("emoji", () => {
  const { createMember, getMockContext, getRoomId } = setupRoomSuite();
  let mockContext: Context;
  let emojiCaller: DecorateRouterRecord<TRPCRouter["message"]["emoji"]>;
  let messageCaller: DecorateRouterRecord<TRPCRouter["message"]>;
  let roomId: string;
  const message = "message";
  const emojiTag = "emojiTag";

  beforeAll(() => {
    mockContext = getMockContext();
    emojiCaller = createCallerFactory(emojiRouter)(mockContext);
    messageCaller = createCallerFactory(messageRouter)(mockContext);
  });

  beforeEach(() => {
    roomId = getRoomId();
  });

  test("reads empty emojis", async () => {
    expect.hasAssertions();

    const newMessage = await messageCaller.createMessage({ message, roomId });
    const readEmojis = await emojiCaller.readEmojis({ messageRowKeys: [newMessage.rowKey], roomId });

    expect(readEmojis).toHaveLength(0);
  });

  test("reads emojis", async () => {
    expect.hasAssertions();

    const newMessage = await messageCaller.createMessage({ message, roomId });
    const newEmoji = await emojiCaller.createEmoji({
      emojiTag,
      messageRowKey: newMessage.rowKey,
      partitionKey: roomId,
    });
    const readEmojis = await emojiCaller.readEmojis({ messageRowKeys: [newMessage.rowKey], roomId });

    expect(readEmojis).toHaveLength(1);
    expect(takeOne(readEmojis)).toStrictEqual(newEmoji);
  });

  test("creates", async () => {
    expect.hasAssertions();

    const newMessage = await messageCaller.createMessage({ message, roomId });
    const newEmoji = await emojiCaller.createEmoji({
      emojiTag,
      messageRowKey: newMessage.rowKey,
      partitionKey: roomId,
    });
    const userId = getMockSession().user.id;

    expect(newEmoji.emojiTag).toBe(emojiTag);
    expect(newEmoji.messageRowKey).toBe(newMessage.rowKey);
    expect(newEmoji.partitionKey).toBe(roomId);
    expect(newEmoji.type).toBe(MessageMetadataType.Emoji);
    expect(newEmoji.userIds).toContain(userId);
  });

  test("fails create with duplicate emoji", async () => {
    expect.hasAssertions();

    const newMessage = await messageCaller.createMessage({ message, roomId });
    const newEmoji = await emojiCaller.createEmoji({
      emojiTag,
      messageRowKey: newMessage.rowKey,
      partitionKey: roomId,
    });

    await expect(
      emojiCaller.createEmoji({ emojiTag, messageRowKey: newMessage.rowKey, partitionKey: roomId }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new InvalidOperationError(Operation.Create, MessageMetadataType.Emoji, JSON.stringify(newEmoji)).message}]`,
    );
  });

  test("on creates emoji", async () => {
    expect.hasAssertions();

    const onCreateEmoji = await emojiCaller.onCreateEmoji({ roomId });
    const newMessage = await messageCaller.createMessage({ message, roomId });
    const data = await getFirstEmit(
      () => onCreateEmoji,
      () => emojiCaller.createEmoji({ emojiTag, messageRowKey: newMessage.rowKey, partitionKey: roomId }),
    );

    expect(data.emojiTag).toBe(emojiTag);
    expect(data.messageRowKey).toBe(newMessage.rowKey);
    expect(data.partitionKey).toBe(roomId);
  });

  test("updates", async () => {
    expect.hasAssertions();

    const newMessage = await messageCaller.createMessage({ message, roomId });
    const newEmoji = await emojiCaller.createEmoji({
      emojiTag,
      messageRowKey: newMessage.rowKey,
      partitionKey: roomId,
    });
    const member = await createMember();
    await mockSessionOnce(mockContext.db, member);
    await emojiCaller.updateEmoji({
      messageRowKey: newEmoji.messageRowKey,
      partitionKey: newEmoji.partitionKey,
      rowKey: newEmoji.rowKey,
    });
    const readEmojis = await emojiCaller.readEmojis({ messageRowKeys: [newMessage.rowKey], roomId });
    const userId = getMockSession().user.id;

    expect(readEmojis).toHaveLength(1);
    expect(takeOne(readEmojis).userIds).toStrictEqual([userId, member.id]);
  });

  test("updates twice removes user id", async () => {
    expect.hasAssertions();

    const newMessage = await messageCaller.createMessage({ message, roomId });
    const newEmoji = await emojiCaller.createEmoji({
      emojiTag,
      messageRowKey: newMessage.rowKey,
      partitionKey: roomId,
    });
    const member = await createMember();
    const updateEmojiInput = {
      messageRowKey: newEmoji.messageRowKey,
      partitionKey: newEmoji.partitionKey,
      rowKey: newEmoji.rowKey,
    };
    await mockSessionOnce(mockContext.db, member);
    await emojiCaller.updateEmoji(updateEmojiInput);
    await mockSessionOnce(mockContext.db, member);
    await emojiCaller.updateEmoji(updateEmojiInput);
    const readEmojis = await emojiCaller.readEmojis({ messageRowKeys: [newMessage.rowKey], roomId });
    const userId = getMockSession().user.id;

    expect(readEmojis).toHaveLength(1);
    expect(takeOne(readEmojis).userIds).toStrictEqual([userId]);
  });

  test("fails update emoji with non-existent emoji", async () => {
    expect.hasAssertions();

    const input = { messageRowKey: "", partitionKey: roomId, rowKey: "" };

    await expect(emojiCaller.updateEmoji(input)).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new NotFoundError(MessageMetadataType.Emoji, JSON.stringify(input)).message}]`,
    );
  });

  test("deletes", async () => {
    expect.hasAssertions();

    const newMessage = await messageCaller.createMessage({ message, roomId });
    const newEmoji = await emojiCaller.createEmoji({
      emojiTag,
      messageRowKey: newMessage.rowKey,
      partitionKey: roomId,
    });

    await emojiCaller.deleteEmoji({
      messageRowKey: newEmoji.messageRowKey,
      partitionKey: newEmoji.partitionKey,
      rowKey: newEmoji.rowKey,
    });

    const readEmojis = await emojiCaller.readEmojis({
      messageRowKeys: [newMessage.rowKey],
      roomId,
    });

    expect(readEmojis).toHaveLength(0);
  });
});
