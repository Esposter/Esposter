import type { StreamTableEntityMap, StandardMessageEntity } from "@esposter/db-schema";
import type { StreamTableClient } from "#src/models/streams/StreamTableClient";

import { createEntity } from "#src/services/streams/createEntity";
import { softDeleteRoomMessagesByUser } from "#src/services/message/softDeleteRoomMessagesByUser";
import { StreamTable, createMessageEntity, MessageType } from "@esposter/db-schema";
import { noop } from "@esposter/shared";
import { MockTableClient } from "azure-mock";
import { v7 } from "uuid";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

describe(softDeleteRoomMessagesByUser, () => {
  beforeEach(() => {
    vi.useFakeTimers({ now: 0, toFake: ["Date"] });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test("soft-deletes only the target user's live messages in that room", async () => {
    expect.hasAssertions();

    const roomId = v7();
    const otherRoomId = v7();
    const targetUserId = v7();
    const otherUserId = v7();
    const messageClient = new MockTableClient("", StreamTable.Messages) as unknown as StreamTableClient<
      StreamTableEntityMap[StreamTable.Messages]
    >;
    const createRoomMessage = async (messageRoomId: string, userId: string) => {
      const message = createMessageEntity({
        message: "message",
        roomId: messageRoomId,
        type: MessageType.Message,
        userId,
      });
      await createEntity(messageClient, message);
      return message;
    };
    const targetMessage = await createRoomMessage(roomId, targetUserId);
    const otherUserMessage = await createRoomMessage(roomId, otherUserId);
    const targetUserOtherRoomMessage = await createRoomMessage(otherRoomId, targetUserId);

    await softDeleteRoomMessagesByUser(messageClient, roomId, targetUserId, noop);

    const readDeletedAt = async (message: StandardMessageEntity) =>
      (await messageClient.getEntity<StandardMessageEntity>(message.partitionKey, message.rowKey)).deletedAt;

    await expect(readDeletedAt(targetMessage)).resolves.toStrictEqual(new Date(0));
    await expect(readDeletedAt(otherUserMessage)).resolves.toBeNull();
    await expect(readDeletedAt(targetUserOtherRoomMessage)).resolves.toBeNull();
  });
});
