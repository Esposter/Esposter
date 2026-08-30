// @vitest-environment happy-dom
import type { Context } from "@@/server/trpc/context";

import { executeAutomodAction } from "@@/server/services/message/moderation/executeAutomodAction";
import { createMockContext, getMockSession } from "@@/server/trpc/context.test";
import { roomsInMessage, usersToRoomsInMessage, WordFilterAction } from "@esposter/db-schema";
import { takeOne } from "@esposter/shared";
import { MockTableDatabase } from "azure-mock";
import { and, eq } from "drizzle-orm";
import { afterEach, beforeAll, beforeEach, describe, expect, test, vi } from "vitest";

describe(executeAutomodAction, () => {
  let mockContext: Context;
  const name = "name";
  const timeoutDurationMs = 1;

  beforeAll(async () => {
    mockContext = await createMockContext();
  });

  // Pin the clock so a 2ms existing timeout stays strictly longer than the 1ms automod timeout.
  beforeEach(() => {
    vi.useFakeTimers({ now: 0 });
  });

  afterEach(async () => {
    vi.useRealTimers();
    MockTableDatabase.clear();
    await mockContext.db.delete(roomsInMessage);
  });

  const setupMembership = async () => {
    const userId = getMockSession().user.id;
    const room = takeOne(await mockContext.db.insert(roomsInMessage).values({ name, userId }).returning());
    await mockContext.db.insert(usersToRoomsInMessage).values({ roomId: room.id, userId });
    return { roomId: room.id, userId };
  };

  const readTimeoutUntil = async (roomId: string, userId: string) => {
    const membership = takeOne(
      await mockContext.db
        .select()
        .from(usersToRoomsInMessage)
        .where(and(eq(usersToRoomsInMessage.roomId, roomId), eq(usersToRoomsInMessage.userId, userId))),
    );
    return membership.timeoutUntil;
  };

  test("does not shorten a longer existing timeout", async () => {
    expect.hasAssertions();

    const { roomId, userId } = await setupMembership();
    const existingTimeoutUntil = new Date(Date.now() + 2);
    await mockContext.db
      .update(usersToRoomsInMessage)
      .set({ timeoutUntil: existingTimeoutUntil })
      .where(and(eq(usersToRoomsInMessage.roomId, roomId), eq(usersToRoomsInMessage.userId, userId)));
    await executeAutomodAction(mockContext.db, { action: WordFilterAction.Timeout, roomId, timeoutDurationMs, userId });

    const timeoutUntil = await readTimeoutUntil(roomId, userId);

    expect(timeoutUntil?.getTime()).toBe(existingTimeoutUntil.getTime());
  });

  test("sets a null existing timeout to the new value", async () => {
    expect.hasAssertions();

    const { roomId, userId } = await setupMembership();
    await executeAutomodAction(mockContext.db, { action: WordFilterAction.Timeout, roomId, timeoutDurationMs, userId });

    const timeoutUntil = await readTimeoutUntil(roomId, userId);

    expect(timeoutUntil?.getTime()).toBe(Date.now() + timeoutDurationMs);
  });

  test("extends an expired existing timeout to the new value", async () => {
    expect.hasAssertions();

    const { roomId, userId } = await setupMembership();
    await mockContext.db
      .update(usersToRoomsInMessage)
      .set({ timeoutUntil: new Date(Date.now() - 1) })
      .where(and(eq(usersToRoomsInMessage.roomId, roomId), eq(usersToRoomsInMessage.userId, userId)));
    await executeAutomodAction(mockContext.db, { action: WordFilterAction.Timeout, roomId, timeoutDurationMs, userId });

    const timeoutUntil = await readTimeoutUntil(roomId, userId);

    expect(timeoutUntil?.getTime()).toBe(Date.now() + timeoutDurationMs);
  });
});
