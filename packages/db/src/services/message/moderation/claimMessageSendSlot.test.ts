import type { MockDatabase } from "@esposter/db-mock";
import type { Database } from "@esposter/db-schema";

import { createUser } from "#src/services/message/createUser.test";
import { claimMessageSendSlot } from "#src/services/message/moderation/claimMessageSendSlot";
import { createMockDb } from "@esposter/db-mock";
import {
  MessageCreationRejectionType,
  RoomPermission,
  roomRolesInMessage,
  roomsInMessage,
  RoomType,
  usersInAuth,
  usersToRoomsInMessage,
} from "@esposter/db-schema";
import { eq } from "drizzle-orm";
import { v7 } from "uuid";
import { afterAll, afterEach, beforeAll, describe, expect, test, vi } from "vitest";

// A racing send of the same member's lands between the gate's decision and the claim, as a real write to the member's
// Clock, so the claim this send makes against the clock it read loses
const { racingSend } = vi.hoisted(() => ({
  racingSend: { remaining: 0, write: (): Promise<unknown> => Promise.resolve() },
}));
vi.mock(import("#src/services/message/moderation/getMessageCreationRejection"), async (importOriginal) => {
  const original = await importOriginal();
  return {
    getMessageCreationRejection: async (...args: Parameters<typeof original.getMessageCreationRejection>) => {
      const rejection = await original.getMessageCreationRejection(...args);
      if (racingSend.remaining > 0) {
        racingSend.remaining -= 1;
        await racingSend.write();
      }
      return rejection;
    },
  };
});

describe(claimMessageSendSlot, () => {
  let db: Database;
  let mockDatabase: MockDatabase;
  const name = "name";
  // The room is another user's, since its owner is held to no slowmode
  const ownerId = v7();
  const userId = v7();
  const slowmodeMs = Temporal.Duration.from({ minutes: 1 }).total("milliseconds");

  const createRoom = async (roomSlowmodeMs: number) => {
    const roomId = v7();
    await db
      .insert(roomsInMessage)
      .values({ id: roomId, name, slowmodeMs: roomSlowmodeMs, type: RoomType.Room, userId: ownerId });
    await db.insert(usersToRoomsInMessage).values({ roomId, userId });
    await db
      .insert(roomRolesInMessage)
      .values({ isEveryone: true, name, permissions: RoomPermission.SendMessages, roomId });
    return roomId;
  };
  // Each racing send moves the member's clock to a later time than the one before it
  const raceSends = (count: number) => {
    let racedAt = Date.now();
    racingSend.remaining = count;
    racingSend.write = () => {
      racedAt += 1;
      return db
        .update(usersToRoomsInMessage)
        .set({ lastMessageAt: new Date(racedAt) })
        .where(eq(usersToRoomsInMessage.userId, userId));
    };
  };

  beforeAll(async () => {
    mockDatabase = await createMockDb();
    db = mockDatabase.db;
    await db.insert(usersInAuth).values([ownerId, userId].map((id) => createUser(id, new Date(0), name)));
  });

  afterEach(async () => {
    racingSend.remaining = 0;
    await db.delete(roomsInMessage);
  });

  afterAll(async () => {
    await db.delete(usersInAuth);
  });

  test("takes a send whose claim lost twice to the member's racing sends in a room with no slowmode", async () => {
    expect.hasAssertions();

    const roomId = await createRoom(0);
    raceSends(2);

    await expect(claimMessageSendSlot(db, userId, roomId, name, new Date())).resolves.toBeUndefined();
    expect(racingSend.remaining).toBe(0);
  });

  test("refuses a send whose claim lost to the member's racing send in a room with slowmode", async () => {
    expect.hasAssertions();

    const roomId = await createRoom(slowmodeMs);
    raceSends(1);

    await expect(claimMessageSendSlot(db, userId, roomId, name, new Date())).resolves.toStrictEqual({
      type: MessageCreationRejectionType.Slowmode,
    });
  });
});
