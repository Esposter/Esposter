import type { Database, StandardMessageEntity } from "@esposter/db-schema";

import { eraseAccountMessages } from "#src/services/account/eraseAccountMessages";
import { getTableClient } from "#src/services/azure/getTableClient";
import { createUser } from "#src/services/shared/createUser.test";
import { createEntity } from "@esposter/db";
import { createMockDb } from "@esposter/db-mock";
import {
  AzureTable,
  createMessageEntity,
  MessageType,
  roomsInMessage,
  usersInAuth,
  usersToRoomsInMessage,
} from "@esposter/db-schema";
import { takeOne } from "@esposter/shared";
import { MockTableDatabase } from "azure-mock";
import { afterEach, beforeAll, beforeEach, describe, expect, test, vi } from "vitest";

let mockDb: Database;

vi.mock(import("#src/services/shared/db"), () => ({
  get db() {
    return mockDb;
  },
}));
vi.mock(import("#src/services/azure/getTableClient"), () => import("#src/services/azure/getTableClient.test"));

describe(eraseAccountMessages, () => {
  const name = "name";

  beforeAll(async () => {
    mockDb = await createMockDb();
  });

  beforeEach(() => {
    vi.useFakeTimers({ now: 0, toFake: ["Date"] });
  });

  afterEach(async () => {
    vi.useRealTimers();
    MockTableDatabase.clear();
    await mockDb.delete(usersInAuth);
  });

  test("erases the account's messages in the rooms it is a member of, and nothing else", async () => {
    expect.hasAssertions();

    const userId = crypto.randomUUID();
    const otherUserId = crypto.randomUUID();
    await mockDb.insert(usersInAuth).values([createUser(userId), createUser(otherUserId)]);
    const memberRoom = takeOne(await mockDb.insert(roomsInMessage).values({ name, userId: otherUserId }).returning());
    const nonMemberRoom = takeOne(
      await mockDb.insert(roomsInMessage).values({ name, userId: otherUserId }).returning(),
    );
    await mockDb.insert(usersToRoomsInMessage).values([
      { roomId: memberRoom.id, userId },
      { roomId: memberRoom.id, userId: otherUserId },
    ]);
    const messageClient = await getTableClient(AzureTable.Messages);
    const createRoomMessage = async (roomId: string, messageUserId: string) => {
      const message = createMessageEntity({
        message: "message",
        roomId,
        type: MessageType.Message,
        userId: messageUserId,
      });
      await createEntity(messageClient, message);
      return message;
    };
    const targetMessage = await createRoomMessage(memberRoom.id, userId);
    const otherUserMessage = await createRoomMessage(memberRoom.id, otherUserId);
    const nonMemberRoomMessage = await createRoomMessage(nonMemberRoom.id, userId);

    await eraseAccountMessages(userId);

    const readRow = (message: StandardMessageEntity) =>
      messageClient.getEntity<StandardMessageEntity>(message.partitionKey, message.rowKey);
    await expect(readRow(targetMessage)).resolves.toMatchObject({ deletedAt: new Date(0), message: "" });
    await expect(readRow(otherUserMessage)).resolves.toMatchObject({ deletedAt: null, message: "message" });
    await expect(readRow(nonMemberRoomMessage)).resolves.toMatchObject({ deletedAt: null, message: "message" });
  });
});
