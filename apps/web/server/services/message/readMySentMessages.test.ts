import type { Database } from "@esposter/db-schema";
import type { MockDatabase } from "@esposter/db-mock";

import { readMySentMessages } from "#server/services/message/readMySentMessages";
import { createMockDb } from "@esposter/db-mock";
import { MessageType, messagesInMessage, roomsInMessage, usersInAuth } from "@esposter/db-schema";
import { afterAll, afterEach, beforeAll, describe, expect, test } from "vitest";

describe(readMySentMessages, () => {
  const userId = "8f1c6a2e-4b7d-4e9a-8c31-2d5f7a9b0c11";
  const otherUserId = "d5e6f7a8-b9c0-4d1e-8f2a-3b4c5d6e7f44";
  const roomId = "3a9e0d4c-6b2f-4a7e-9d15-7c8b1e2f3a22";
  const messageId = "1b2c3d4e-5f60-4718-9a0b-c1d2e3f4a501";
  const otherMessageId = "2c3d4e5f-6071-4829-8b1c-d2e3f4a5b612";
  const deletedMessageId = "3d4e5f60-7182-4930-9c2d-e3f4a5b6c723";

  let db: Database;
  let mockDatabase: MockDatabase;

  beforeAll(async () => {
    mockDatabase = await createMockDb();
    db = mockDatabase.db;
  });

  afterAll(async () => {
    await mockDatabase.dispose();
  });

  afterEach(async () => {
    await mockDatabase.reset();
  });

  test("lists my live messages with their room, leaving out others' and deleted ones", async () => {
    expect.hasAssertions();

    await db.insert(usersInAuth).values([
      { email: "ann@example.com", emailVerified: false, id: userId, name: "Ann" },
      { email: "ben@example.com", emailVerified: false, id: otherUserId, name: "Ben" },
    ]);
    await db.insert(roomsInMessage).values({ id: roomId, name: "room", userId });
    await db.insert(messagesInMessage).values([
      { id: messageId, message: "mine", roomId, type: MessageType.Message, userId },
      { id: otherMessageId, message: "theirs", roomId, type: MessageType.Message, userId: otherUserId },
      { deletedAt: new Date(), id: deletedMessageId, message: "gone", roomId, type: MessageType.Message, userId },
    ]);

    const { count, data } = await readMySentMessages({ limit: 10, offset: 0 }, db, userId);

    expect(count).toBe(1);
    expect(data.hasMore).toBe(false);
    expect(data.items.map(({ message, room }) => [message.id, room.id])).toStrictEqual([[messageId, roomId]]);
  });
});
