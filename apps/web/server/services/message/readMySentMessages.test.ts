import type { useRoomObject } from "#server/composables/realtime/useRoomObject";
import type { useUserObject } from "#server/composables/realtime/useUserObject";
import type { MockDatabase } from "@esposter/db-mock";
import type { Database, RoomObjectRpc, UserObjectRpc } from "@esposter/db-schema";

import { createRoomMessage } from "#server/services/message/createRoomMessage.test";
import { readMySentMessages } from "#server/services/message/readMySentMessages";
import { createMockDb } from "@esposter/db-mock";
import {
  encodePageCursor,
  roomsInMessage,
  START_PAGE_CURSOR,
  usersInAuth,
  usersToRoomsInMessage,
} from "@esposter/db-schema";
import { eq } from "drizzle-orm";
import { afterAll, afterEach, beforeAll, describe, expect, test, vi } from "vitest";

// The sender's index is the user's object and each room's messages are that room's object, so both are faked. The rooms
// The page names are real rows, read for the room each message came from
const { roomObject, userObject } = vi.hoisted(() => ({
  roomObject: { readMessagesByIds: vi.fn<RoomObjectRpc["readMessagesByIds"]>() },
  userObject: { readSentMessages: vi.fn<UserObjectRpc["readSentMessages"]>() },
}));
vi.mock(import("#server/composables/realtime/useRoomObject"), () => ({
  useRoomObject: () => roomObject as unknown as ReturnType<typeof useRoomObject>,
}));
vi.mock(import("#server/composables/realtime/useUserObject"), () => ({
  useUserObject: () => userObject as unknown as ReturnType<typeof useUserObject>,
}));

describe(readMySentMessages, () => {
  const userId = "8f1c6a2e-4b7d-7e9a-8c31-2d5f7a9b0c11";
  const roomId = "3a9e0d4c-6b2f-7a7e-9d15-7c8b1e2f3a22";
  const otherRoomId = "c4d7b2a1-9e3f-7f60-8a2b-5e6d7c8b9a33";
  const createdAt = new Date(0);
  const memberships = [
    { roomId, userId },
    { roomId: otherRoomId, userId },
  ];

  let db: Database;
  let mockDatabase: MockDatabase;

  beforeAll(async () => {
    mockDatabase = await createMockDb();
    db = mockDatabase.db;
  });

  afterEach(async () => {
    await mockDatabase.reset();
  });

  afterAll(async () => {
    await mockDatabase.dispose();
  });

  const insertUserAndRooms = async () => {
    await db.insert(usersInAuth).values({ email: "ann@example.com", emailVerified: false, id: userId, name: "Ann" });
    await db.insert(roomsInMessage).values([
      { id: roomId, name: "room", userId },
      { id: otherRoomId, name: "other", userId },
    ]);
    await db.insert(usersToRoomsInMessage).values(memberships);
  };

  test("pages the sender's index newest first, asking one past the limit, and continues from the last entry kept", async () => {
    expect.hasAssertions();

    await insertUserAndRooms();
    const messages = [createRoomMessage({ id: 1, userId }), createRoomMessage({ id: 2, userId })];
    userObject.readSentMessages.mockResolvedValue([
      { createdAt, messageId: 1, roomId },
      { createdAt, messageId: 2, roomId: otherRoomId },
      { createdAt, messageId: 3, roomId },
    ]);
    roomObject.readMessagesByIds.mockImplementation((ids) => messages.filter(({ id }) => ids.includes(id)));

    const { items, nextCursor } = await readMySentMessages({ cursor: START_PAGE_CURSOR, limit: 2 }, db, userId);

    expect(userObject.readSentMessages).toHaveBeenCalledExactlyOnceWith({
      cursor: { isBackward: false, values: [] },
      limit: 3,
    });
    // The index's order is the page's, even where the rooms alternate
    expect(items.map(({ message, room }) => [message.id, room.id])).toStrictEqual([
      [1, roomId],
      [2, otherRoomId],
    ]);
    expect(nextCursor).toBe(encodePageCursor({ isBackward: false, values: [0, otherRoomId, 2] }));
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

    const { items, nextCursor } = await readMySentMessages({ cursor: START_PAGE_CURSOR, limit: 2 }, db, userId);

    expect(nextCursor).toBe("");
    expect(items.map(({ message }) => message.id)).toStrictEqual([1]);
  });

  // Every message of a page can be gone, so the cursor names the index's last entry, and the next page still starts past it
  test("names the index's last entry as the cursor, even when none of the page's messages survived", async () => {
    expect.hasAssertions();

    await insertUserAndRooms();
    userObject.readSentMessages.mockResolvedValue([
      { createdAt, messageId: 1, roomId },
      { createdAt, messageId: 2, roomId },
    ]);
    roomObject.readMessagesByIds.mockReturnValue([]);

    const { items, nextCursor } = await readMySentMessages({ cursor: START_PAGE_CURSOR, limit: 1 }, db, userId);

    expect(items).toStrictEqual([]);
    expect(nextCursor).toBe(encodePageCursor({ isBackward: false, values: [0, roomId, 1] }));
  });

  // A room the caller has left keeps its messages in the sender's index, but its row is not theirs to show
  test("leaves out the sent messages of a room the caller has left", async () => {
    expect.hasAssertions();

    await insertUserAndRooms();
    await db.delete(usersToRoomsInMessage).where(eq(usersToRoomsInMessage.roomId, otherRoomId));
    userObject.readSentMessages.mockResolvedValue([
      { createdAt, messageId: 1, roomId: otherRoomId },
      { createdAt, messageId: 2, roomId },
    ]);
    roomObject.readMessagesByIds.mockImplementation((ids) => ids.map((id) => createRoomMessage({ id, userId })));

    const { items } = await readMySentMessages({ cursor: START_PAGE_CURSOR, limit: 2 }, db, userId);

    expect(items.map(({ message, room }) => [message.id, room.id])).toStrictEqual([[2, roomId]]);
  });
});
