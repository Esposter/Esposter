import type { Database } from "@esposter/db-schema";

import { assertCanCreateMessage } from "@/services/assertCanCreateMessage";
import { InvocationContext } from "@azure/functions";
import { createMockDb } from "@esposter/db-mock";
import {
  DatabaseEntityType,
  roomFiltersInMessage,
  roomsInMessage,
  users,
  usersToRoomsInMessage,
  WordFilterAction,
} from "@esposter/db-schema";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { and, eq } from "drizzle-orm";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, test, vi } from "vitest";

let mockDb: Database;

vi.mock(import("@/services/db"), () => ({
  get db() {
    return mockDb;
  },
}));
vi.mock(import("@/services/getTableClient"), () => import("@/services/getTableClient.test"));

describe(assertCanCreateMessage, () => {
  const context = new InvocationContext({ logHandler: () => {} });
  const memberUserId = crypto.randomUUID();
  const name = "name";
  const ownerUserId = crypto.randomUUID();
  const roomId = crypto.randomUUID();

  beforeAll(async () => {
    mockDb = await createMockDb();
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

  beforeEach(() => {
    vi.useFakeTimers({ now: 0 });
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
    vi.useRealTimers();
  });

  afterAll(async () => {
    await mockDb.delete(users);
  });

  test("throws when room not found", async () => {
    expect.hasAssertions();

    const missingRoomId = crypto.randomUUID();

    await expect(
      assertCanCreateMessage(context, memberUserId, missingRoomId, ""),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: ${new InvalidOperationError(Operation.Create, DatabaseEntityType.ScheduledMessageJob, missingRoomId).message}]`,
    );
  });

  test("throws when member not found", async () => {
    expect.hasAssertions();

    await expect(
      assertCanCreateMessage(context, crypto.randomUUID(), roomId, ""),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: ${new InvalidOperationError(Operation.Create, DatabaseEntityType.ScheduledMessageJob, roomId).message}]`,
    );
  });

  test("throws when member is timed out", async () => {
    expect.hasAssertions();

    await mockDb
      .update(usersToRoomsInMessage)
      .set({ timeoutUntil: new Date(Date.now() + 1) })
      .where(and(eq(usersToRoomsInMessage.roomId, roomId), eq(usersToRoomsInMessage.userId, memberUserId)));

    await expect(assertCanCreateMessage(context, memberUserId, roomId, "")).rejects.toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: ${new InvalidOperationError(Operation.Create, DatabaseEntityType.ScheduledMessageJob, roomId).message}]`,
    );
  });

  test("throws when room is read only and member cannot manage messages", async () => {
    expect.hasAssertions();

    await mockDb.update(roomsInMessage).set({ isReadOnly: true }).where(eq(roomsInMessage.id, roomId));

    await expect(assertCanCreateMessage(context, memberUserId, roomId, "")).rejects.toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: ${new InvalidOperationError(Operation.Create, DatabaseEntityType.ScheduledMessageJob, roomId).message}]`,
    );
  });

  test("passes when room is read only but member is owner", async () => {
    expect.hasAssertions();

    await mockDb.update(roomsInMessage).set({ isReadOnly: true }).where(eq(roomsInMessage.id, roomId));

    await expect(assertCanCreateMessage(context, ownerUserId, roomId, "")).resolves.toBeUndefined();
  });

  test("throws when slowmode is active and not enough time has elapsed", async () => {
    expect.hasAssertions();

    await mockDb.update(roomsInMessage).set({ slowmodeMs: 1 }).where(eq(roomsInMessage.id, roomId));
    await mockDb
      .update(usersToRoomsInMessage)
      .set({ lastMessageAt: new Date() })
      .where(and(eq(usersToRoomsInMessage.roomId, roomId), eq(usersToRoomsInMessage.userId, memberUserId)));

    await expect(assertCanCreateMessage(context, memberUserId, roomId, "")).rejects.toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: ${new InvalidOperationError(Operation.Create, DatabaseEntityType.ScheduledMessageJob, roomId).message}]`,
    );
  });

  test("throws when message contains a filtered word", async () => {
    expect.hasAssertions();

    await mockDb.insert(roomFiltersInMessage).values({ roomId, words: ["a"] });

    await expect(assertCanCreateMessage(context, memberUserId, roomId, "a")).rejects.toThrowErrorMatchingInlineSnapshot(
      `[WordFilteredError: ${new InvalidOperationError(Operation.Create, DatabaseEntityType.ScheduledMessageJob, roomId).message}]`,
    );
  });

  test("times the member out when the filter action is timeout", async () => {
    expect.hasAssertions();

    const timeoutDurationMs = 1;
    await mockDb
      .insert(roomFiltersInMessage)
      .values({ action: WordFilterAction.Timeout, roomId, timeoutDurationMs, words: ["a"] });

    await expect(assertCanCreateMessage(context, memberUserId, roomId, "a")).rejects.toThrowErrorMatchingInlineSnapshot(
      `[WordFilteredError: ${new InvalidOperationError(Operation.Create, DatabaseEntityType.ScheduledMessageJob, roomId).message}]`,
    );

    const member = await mockDb.query.usersToRoomsInMessage.findFirst({
      columns: { timeoutUntil: true },
      where: { roomId: { eq: roomId }, userId: { eq: memberUserId } },
    });
    expect(member?.timeoutUntil).toStrictEqual(new Date(timeoutDurationMs));
  });

  test("passes when all conditions are met", async () => {
    expect.hasAssertions();

    await expect(assertCanCreateMessage(context, memberUserId, roomId, "a")).resolves.toBeUndefined();
  });
});
