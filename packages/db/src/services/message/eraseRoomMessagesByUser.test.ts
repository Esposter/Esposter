import type { AzureTableEntityMap, CustomTableClient, StandardMessageEntity } from "@esposter/db-schema";

import { createEntity } from "#src/services/azure/table/createEntity";
import { updateEntity } from "#src/services/azure/table/updateEntity";
import { eraseRoomMessagesByUser } from "#src/services/message/eraseRoomMessagesByUser";
import { AzureTable, createMessageEntity, MessageType } from "@esposter/db-schema";
import { noop } from "@esposter/shared";
import { MockTableClient } from "azure-mock";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

describe(eraseRoomMessagesByUser, () => {
  beforeEach(() => {
    vi.useFakeTimers({ now: 0, toFake: ["Date"] });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test("erases the text and files of the target user's messages in that room, and nothing else", async () => {
    expect.hasAssertions();

    const roomId = crypto.randomUUID();
    const otherRoomId = crypto.randomUUID();
    const targetUserId = crypto.randomUUID();
    const otherUserId = crypto.randomUUID();
    const messageClient = new MockTableClient("", AzureTable.Messages) as unknown as CustomTableClient<
      AzureTableEntityMap[AzureTable.Messages]
    >;
    const file = {
      filename: "",
      hasThumbnail: false,
      id: crypto.randomUUID(),
      isSpoiler: false,
      mimetype: "",
      size: 0,
    };
    const createRoomMessage = async (messageRoomId: string, userId: string) => {
      const message = createMessageEntity({
        files: [file],
        message: "message",
        roomId: messageRoomId,
        type: MessageType.Message,
        userId,
      });
      message.linkPreviewResponse = { favicons: [], mediaType: "", url: "" };
      await createEntity(messageClient, message);
      return message;
    };
    const targetMessage = await createRoomMessage(roomId, targetUserId);
    const otherUserMessage = await createRoomMessage(roomId, otherUserId);
    const targetUserOtherRoomMessage = await createRoomMessage(otherRoomId, targetUserId);

    await eraseRoomMessagesByUser(messageClient, roomId, targetUserId, noop);

    const readRow = (message: StandardMessageEntity) =>
      messageClient.getEntity<StandardMessageEntity>(message.partitionKey, message.rowKey);
    await expect(readRow(targetMessage)).resolves.toMatchObject({ deletedAt: new Date(0), files: "[]", message: "" });
    await expect(readRow(otherUserMessage)).resolves.toMatchObject({ deletedAt: null, message: "message" });
    await expect(readRow(targetUserOtherRoomMessage)).resolves.toMatchObject({ deletedAt: null, message: "message" });
  });

  test("clears the link preview of an erased message rather than keeping it", async () => {
    expect.hasAssertions();

    const roomId = crypto.randomUUID();
    const targetUserId = crypto.randomUUID();
    const messageClient = new MockTableClient("", AzureTable.Messages) as unknown as CustomTableClient<
      AzureTableEntityMap[AzureTable.Messages]
    >;
    const message = createMessageEntity({
      message: "message",
      roomId,
      type: MessageType.Message,
      userId: targetUserId,
    });
    message.linkPreviewResponse = { favicons: [], mediaType: "", url: "" };
    await createEntity(messageClient, message);

    await eraseRoomMessagesByUser(messageClient, roomId, targetUserId, noop);

    await expect(
      messageClient.getEntity<StandardMessageEntity>(message.partitionKey, message.rowKey),
    ).resolves.not.toHaveProperty("linkPreviewResponse");
  });

  test("refuses to erase a message another write changed after it was listed, and keeps that write", async () => {
    expect.hasAssertions();

    const roomId = crypto.randomUUID();
    const targetUserId = crypto.randomUUID();
    const messageClient = new MockTableClient("", AzureTable.Messages) as unknown as CustomTableClient<
      AzureTableEntityMap[AzureTable.Messages]
    >;
    const message = createMessageEntity({
      message: "message",
      roomId,
      type: MessageType.Message,
      userId: targetUserId,
    });
    await createEntity(messageClient, message);
    const { partitionKey, rowKey } = message;
    // A write lands between the listing and the erase's batch, the window the listed etag exists to guard
    const submitTransaction = messageClient.submitTransaction.bind(messageClient);
    vi.spyOn(messageClient, "submitTransaction").mockImplementationOnce(async (actions) => {
      await updateEntity(messageClient, { message: "edited", partitionKey, rowKey }, "Merge");
      return submitTransaction(actions);
    });

    await expect(
      eraseRoomMessagesByUser(messageClient, roomId, targetUserId, noop),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[MockRestError: The update condition specified in the request was not satisfied.]`,
    );
    await expect(messageClient.getEntity<StandardMessageEntity>(partitionKey, rowKey)).resolves.toMatchObject({
      message: "edited",
    });
  });

  test("erases a message a moderation ban already soft-deleted, since the ban keeps its text", async () => {
    expect.hasAssertions();

    const roomId = crypto.randomUUID();
    const targetUserId = crypto.randomUUID();
    const messageClient = new MockTableClient("", AzureTable.Messages) as unknown as CustomTableClient<
      AzureTableEntityMap[AzureTable.Messages]
    >;
    const message = createMessageEntity({
      message: "message",
      roomId,
      type: MessageType.Message,
      userId: targetUserId,
    });
    message.deletedAt = new Date(0);
    await createEntity(messageClient, message);

    await eraseRoomMessagesByUser(messageClient, roomId, targetUserId, noop);

    await expect(
      messageClient.getEntity<StandardMessageEntity>(message.partitionKey, message.rowKey),
    ).resolves.toMatchObject({ deletedAt: new Date(0), message: "" });
  });
});
