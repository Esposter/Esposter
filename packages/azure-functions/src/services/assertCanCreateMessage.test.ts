import type { relations } from "@esposter/db-schema";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";

import { assertCanCreateMessage } from "@/services/assertCanCreateMessage";
import { createMockDb } from "@esposter/db-mock";
import { roomFiltersInMessage, roomsInMessage, users, usersToRoomsInMessage } from "@esposter/db-schema";
import { InvalidOperationError } from "@esposter/shared";
import { and, eq } from "drizzle-orm";
import { afterEach, beforeAll, describe, expect, test, vi } from "vitest";

let mockDb: PostgresJsDatabase<typeof relations>;

vi.mock(import("@/services/db"), () => ({
  get db() {
    return mockDb;
  },
}));

describe(assertCanCreateMessage, () => {
  const name = "name";

  let ownerUserId: string;
  let memberUserId: string;
  let roomId: string;

  beforeAll(async () => {
    mockDb = await createMockDb();
    ownerUserId = crypto.randomUUID();
    memberUserId = crypto.randomUUID();
    roomId = crypto.randomUUID();

    await mockDb.insert(users).values([
      { email: "", emailVerified: true, id: ownerUserId, name },
      { email: " ", emailVerified: true, id: memberUserId, name },
    ]);
    await mockDb.insert(roomsInMessage).values({ id: roomId, name, userId: ownerUserId });
    await mockDb.insert(usersToRoomsInMessage).values([
      { roomId, userId: ownerUserId },
      { roomId, userId: memberUserId },
    ]);
  });

  afterEach(async () => {
    await mockDb
      .update(roomsInMessage)
      .set({ isReadOnly: false, slowmodeMs: null })
      .where(eq(roomsInMessage.id, roomId));
    await mockDb
      .update(usersToRoomsInMessage)
      .set({ lastMessageAt: null, timeoutUntil: null })
      .where(and(eq(usersToRoomsInMessage.roomId, roomId), eq(usersToRoomsInMessage.userId, memberUserId)));
    await mockDb.delete(roomFiltersInMessage).where(eq(roomFiltersInMessage.roomId, roomId));
  });

  test("throws when room not found", async () => {
    expect.hasAssertions();

    await expect(assertCanCreateMessage(memberUserId, crypto.randomUUID(), "")).rejects.toBeInstanceOf(
      InvalidOperationError,
    );
  });

  test("throws when member not found", async () => {
    expect.hasAssertions();

    await expect(assertCanCreateMessage(crypto.randomUUID(), roomId, "")).rejects.toBeInstanceOf(InvalidOperationError);
  });

  test("throws when member is timed out", async () => {
    expect.hasAssertions();

    await mockDb
      .update(usersToRoomsInMessage)
      .set({ timeoutUntil: new Date(Date.now() + 999_999_999) })
      .where(and(eq(usersToRoomsInMessage.roomId, roomId), eq(usersToRoomsInMessage.userId, memberUserId)));

    await expect(assertCanCreateMessage(memberUserId, roomId, "")).rejects.toBeInstanceOf(InvalidOperationError);
  });

  test("throws when room is read only and member cannot manage messages", async () => {
    expect.hasAssertions();

    await mockDb.update(roomsInMessage).set({ isReadOnly: true }).where(eq(roomsInMessage.id, roomId));

    await expect(assertCanCreateMessage(memberUserId, roomId, "")).rejects.toBeInstanceOf(InvalidOperationError);
  });

  test("passes when room is read only but member is owner", async () => {
    expect.hasAssertions();

    await mockDb.update(roomsInMessage).set({ isReadOnly: true }).where(eq(roomsInMessage.id, roomId));

    await expect(assertCanCreateMessage(ownerUserId, roomId, "")).resolves.toBeUndefined();
  });

  test("throws when slowmode is active and not enough time has elapsed", async () => {
    expect.hasAssertions();

    await mockDb.update(roomsInMessage).set({ slowmodeMs: 999_999_999 }).where(eq(roomsInMessage.id, roomId));
    await mockDb
      .update(usersToRoomsInMessage)
      .set({ lastMessageAt: new Date() })
      .where(and(eq(usersToRoomsInMessage.roomId, roomId), eq(usersToRoomsInMessage.userId, memberUserId)));

    await expect(assertCanCreateMessage(memberUserId, roomId, "")).rejects.toBeInstanceOf(InvalidOperationError);
  });

  test("throws when message contains a filtered word", async () => {
    expect.hasAssertions();

    await mockDb.insert(roomFiltersInMessage).values({ roomId, words: ["bad"] });

    await expect(assertCanCreateMessage(memberUserId, roomId, "this is bad")).rejects.toBeInstanceOf(
      InvalidOperationError,
    );
  });

  test("passes when all conditions are met", async () => {
    expect.hasAssertions();

    await expect(assertCanCreateMessage(memberUserId, roomId, "hello")).resolves.toBeUndefined();
  });
});
