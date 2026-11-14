import type { MockDatabase } from "@esposter/db-mock";
import type { Database, RoomObjectRpc, UserObjectRpc } from "@esposter/db-schema";

import { createRoomMessage } from "#server/services/message/createRoomMessage.test";
import { readMySentMessages } from "#server/services/message/readMySentMessages";
import { createMockDb } from "@esposter/db-mock";
import { roomsInMessage, usersInAuth } from "@esposter/db-schema";
import { afterAll, afterEach, beforeAll, describe, expect, test, vi } from "vitest";

// The sender's index is the user's object and each room's messages are that room's object, so both are faked. The rooms
// the page names are real rows, read for the room each message came from
const { roomObject, userObject } = vi.hoisted(() => ({
  roomObject: { readMessagesByIds: vi.fn<RoomObjectRpc["readMessagesByIds"]>() },
  userObject: { readSentMessages: vi.fn<UserObjectRpc["readSentMessages"]>() },
}));
vi.mock("#server/composables/realtime/useRoomObject", () => ({ useRoomObject: () => roomObject }));
vi.mock("#server/composables/realtime/useUserObject", () => ({ useUserObject: () => userObject }));

describe(readMySentMessages, () => {
  const userId = "8f1c6a2e-4b7d-7e9a-8c31-2d5f7a9b0c11";
  const roomId = "3a9e0d4c-6b2f-7a7e-9d15-7c8b1e2f3a22";
  const otherRoomId = "c4d7b2a1-9e3f-7f60-8a2b-5e6d7c8b9a33";
  const createdAt = new Date(0);

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

  const insertUserAndRooms = async () => {
    await db.insert(usersInAuth).values({ email: "ann@example.com", emailVerified: false, id: userId, name: "Ann" });
    await db.insert(roomsInMessage).values([
      { id: roomId, name: "room", userId },
      { id: otherRoomId, name: "other", userId },
    ]);
  };

  test("pages the sender's index newest first, asking one past the limit from the cursor", async () => {
    expect.hasAssertions();

    await insertUserAndRooms();
    const cursor = { createdAt, messageId: 4, roomId };
    const messages = [createRoomMessage({ id: 1, userId }), createRoomMessage({ id: 2, userId })];
    userObject.readSentMessages.mockResolvedValue([
      { createdAt, messageId: 1, roomId },
      { createdAt, messageId: 2, roomId: otherRoomId },
      { createdAt, messageId: 3, roomId },
    ]);
    roomObject.readMessagesByIds.mockImplementation((ids) => messages.filter(({ id }) => ids.includes(id)));

    const { hasMore, items } = await readMySentMessages({ before: cursor, limit: 2 }, db, userId);

    expect(userObject.readSentMessages).toHaveBeenCalledExactlyOnceWith({ before: cursor, limit: 3 });
    expect(hasMore).toBe(true);
    // The index's order is the page's, even where the rooms alternate
    expect(items.map(({ message, room }) => [message.id, room.id])).toStrictEqual([
      [1, roomId],
      [2, otherRoomId],
    ]);
  });

  // A message its room no longer holds is deleted, so the page is shorter by that one and no later entry takes its place
  test("leaves out a sent message its room no longer holds, with nothing taken in its place", async () => {
    expect.hasAssertions();

    await insertUserAndRooms();
    userObject.readSentMessages.mockResolvedValue([
      { createdAt, messageId: 1, roomId },
      { createdAt, messageId: 2, roomId },
    ]);
    roomObject.readMessagesByIds.mockReturnValue([createRoomMessage({ id: 1, userId })]);

    const { hasMore, items } = await readMySentMessages({ limit: 2 }, db, userId);

    expect(hasMore).toBe(false);
    expect(items.map(({ message }) => message.id)).toStrictEqual([1]);
  });
});
