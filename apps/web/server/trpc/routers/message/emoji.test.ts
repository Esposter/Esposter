import type { Context } from "#server/trpc/context";
import type { TRPCRouter } from "#server/trpc/routers";
import type { DecorateRouterRecord } from "@trpc/server/unstable-core-do-not-import";

import { createCallerFactory } from "#server/trpc";
import { getMockSession, mockSessionOnce } from "#server/trpc/context.test";
import { getFirstEmit } from "#server/trpc/routers/getFirstEmit.test";
import { messageRouter } from "#server/trpc/routers/message";
import { emojiRouter } from "#server/trpc/routers/message/emoji";
import { setupRoomSuite } from "#server/trpc/routers/setupRoomSuite.test";
import { getReverseTickedTimestamp, MessageMetadataType } from "@esposter/db-schema";
import { InvalidOperationError, NotFoundError, Operation, takeOne } from "@esposter/shared";
import { MockTableClient } from "azure-mock";
import { afterEach, beforeAll, beforeEach, describe, expect, test, vi } from "vitest";

describe("emojiRouter", () => {
  const { createMember, getMockContext, getRoomId } = setupRoomSuite();
  let mockContext: Context;
  let emojiCaller: DecorateRouterRecord<TRPCRouter["message"]["emoji"]>;
  let messageCaller: DecorateRouterRecord<TRPCRouter["message"]>;
  let roomId: string;
  const message = "message";
  const emojiTag = "👍";
  const timeZone = "UTC";

  // Every emoji hangs off a message the test has to post first, and every write against one addresses it by the
  // Same three keys
  const setupEmoji = async () => {
    const newMessage = await messageCaller.createMessage({ message, roomId, timeZone });
    const newEmoji = await emojiCaller.createEmoji({
      emojiTag,
      messageRowKey: newMessage.rowKey,
      partitionKey: roomId,
    });
    const emojiKey = {
      messageRowKey: newEmoji.messageRowKey,
      partitionKey: newEmoji.partitionKey,
      rowKey: newEmoji.rowKey,
    };
    return { emojiKey, newEmoji, newMessage };
  };

  beforeAll(() => {
    mockContext = getMockContext();
    emojiCaller = createCallerFactory(emojiRouter)(mockContext);
    messageCaller = createCallerFactory(messageRouter)(mockContext);
  });

  beforeEach(() => {
    roomId = getRoomId();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("reads empty emojis", async () => {
    expect.hasAssertions();

    const newMessage = await messageCaller.createMessage({ message, roomId, timeZone });
    const emojis = await emojiCaller.readEmojis({ messageRowKeys: [newMessage.rowKey], roomId });

    expect(emojis).toHaveLength(0);
  });

  test("reads emojis", async () => {
    expect.hasAssertions();

    const { newEmoji, newMessage } = await setupEmoji();
    const emojis = await emojiCaller.readEmojis({ messageRowKeys: [newMessage.rowKey], roomId });

    expect(emojis).toHaveLength(1);
    expect(takeOne(emojis)).toStrictEqual(newEmoji);
  });

  test("creates", async () => {
    expect.hasAssertions();

    const { newEmoji, newMessage } = await setupEmoji();
    const userId = getMockSession().user.id;

    expect(newEmoji.emojiTag).toBe(emojiTag);
    expect(newEmoji.messageRowKey).toBe(newMessage.rowKey);
    expect(newEmoji.partitionKey).toBe(roomId);
    expect(newEmoji.type).toBe(MessageMetadataType.Emoji);
    expect(newEmoji.userIds).toStrictEqual([userId]);
  });

  test("fails create with duplicate emoji", async () => {
    expect.hasAssertions();

    const { newEmoji, newMessage } = await setupEmoji();

    await expect(
      emojiCaller.createEmoji({ emojiTag, messageRowKey: newMessage.rowKey, partitionKey: roomId }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new InvalidOperationError(Operation.Create, MessageMetadataType.Emoji, JSON.stringify(newEmoji)).message}]`,
    );
  });

  test("subscription emits the created emoji", async () => {
    expect.hasAssertions();

    const subscription = await emojiCaller.onCreateEmoji({ roomId });
    const newMessage = await messageCaller.createMessage({ message, roomId, timeZone });
    const data = await getFirstEmit(
      () => subscription,
      () => emojiCaller.createEmoji({ emojiTag, messageRowKey: newMessage.rowKey, partitionKey: roomId }),
    );

    expect(data.emojiTag).toBe(emojiTag);
    expect(data.messageRowKey).toBe(newMessage.rowKey);
    expect(data.partitionKey).toBe(roomId);
  });

  test("updates", async () => {
    expect.hasAssertions();

    const { emojiKey, newMessage } = await setupEmoji();
    const member = await createMember();
    await mockSessionOnce(mockContext.db, member);
    await emojiCaller.updateEmoji(emojiKey);
    const emojis = await emojiCaller.readEmojis({ messageRowKeys: [newMessage.rowKey], roomId });
    const userId = getMockSession().user.id;

    expect(emojis).toHaveLength(1);
    expect(takeOne(emojis).userIds).toStrictEqual([userId, member.id]);
  });

  test("keeps a reaction on its own message whatever message the caller names", async () => {
    expect.hasAssertions();

    const { emojiKey, newMessage } = await setupEmoji();
    const otherMessage = await messageCaller.createMessage({ message, roomId, timeZone });
    const member = await createMember();
    await mockSessionOnce(mockContext.db, member);
    await emojiCaller.updateEmoji({ ...emojiKey, messageRowKey: otherMessage.rowKey });
    const emojis = await emojiCaller.readEmojis({ messageRowKeys: [newMessage.rowKey], roomId });

    expect(emojis.map(({ userIds }) => userIds)).toStrictEqual([[getMockSession().user.id, member.id]]);
  });

  test("updateEmoji twice removes the user id", async () => {
    expect.hasAssertions();

    const { emojiKey, newMessage } = await setupEmoji();
    const member = await createMember();
    await mockSessionOnce(mockContext.db, member);
    await emojiCaller.updateEmoji(emojiKey);
    await mockSessionOnce(mockContext.db, member);
    await emojiCaller.updateEmoji(emojiKey);
    const emojis = await emojiCaller.readEmojis({ messageRowKeys: [newMessage.rowKey], roomId });
    const userId = getMockSession().user.id;

    expect(emojis).toHaveLength(1);
    expect(takeOne(emojis).userIds).toStrictEqual([userId]);
  });

  test("fails update emoji with non-existent emoji", async () => {
    expect.hasAssertions();

    // Well-formed and absent rather than malformed: a key the schema rejects never reaches the lookup this
    // Test is named for
    const input = {
      messageRowKey: getReverseTickedTimestamp(),
      partitionKey: roomId,
      rowKey: getReverseTickedTimestamp(),
    };

    await expect(emojiCaller.updateEmoji(input)).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new NotFoundError(MessageMetadataType.Emoji, JSON.stringify(input)).message}]`,
    );
  });

  test("fails update by a member who is the only reactor", async () => {
    expect.hasAssertions();

    const { emojiKey, newEmoji, newMessage } = await setupEmoji();

    await expect(emojiCaller.updateEmoji(emojiKey)).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new InvalidOperationError(Operation.Update, MessageMetadataType.Emoji, JSON.stringify(newEmoji)).message}]`,
    );

    const emojis = await emojiCaller.readEmojis({ messageRowKeys: [newMessage.rowKey], roomId });

    expect(emojis).toStrictEqual([newEmoji]);
  });

  test("deletes", async () => {
    expect.hasAssertions();

    const { emojiKey, newMessage } = await setupEmoji();

    await emojiCaller.deleteEmoji(emojiKey);

    const emojis = await emojiCaller.readEmojis({ messageRowKeys: [newMessage.rowKey], roomId });

    expect(emojis).toHaveLength(0);
  });

  test("fails delete by a member who is not its only reactor", async () => {
    expect.hasAssertions();

    const { emojiKey, newEmoji, newMessage } = await setupEmoji();
    const member = await createMember();
    await mockSessionOnce(mockContext.db, member);

    await expect(emojiCaller.deleteEmoji(emojiKey)).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new InvalidOperationError(Operation.Delete, MessageMetadataType.Emoji, JSON.stringify(emojiKey)).message}]`,
    );

    const emojis = await emojiCaller.readEmojis({ messageRowKeys: [newMessage.rowKey], roomId });

    expect(emojis).toStrictEqual([newEmoji]);
  });

  test("two members reacting at once both keep their reaction", async () => {
    expect.hasAssertions();

    const { emojiKey, newMessage } = await setupEmoji();
    const firstMember = await createMember();
    const secondMember = await createMember();
    const { getEntity } = MockTableClient.prototype;
    // The second member reacts between the first member's read and its write, so the first member's write is
    // Computed against a user list that no longer stands
    vi.spyOn(MockTableClient.prototype, "getEntity").mockImplementationOnce(async function (
      this: MockTableClient,
      ...args
    ) {
      const staleEntity = await getEntity.apply(this, args);
      await mockSessionOnce(mockContext.db, secondMember);
      await emojiCaller.updateEmoji(emojiKey);
      return staleEntity;
    });
    await mockSessionOnce(mockContext.db, firstMember);
    await emojiCaller.updateEmoji(emojiKey);
    const emojis = await emojiCaller.readEmojis({ messageRowKeys: [newMessage.rowKey], roomId });

    expect(takeOne(emojis).userIds).toStrictEqual(expect.arrayContaining([firstMember.id, secondMember.id]));
  });
});
