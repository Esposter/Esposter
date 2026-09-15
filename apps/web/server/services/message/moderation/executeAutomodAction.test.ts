// @vitest-environment happy-dom
import type { Context } from "@@/server/trpc/context";

import { executeAutomodAction } from "@@/server/services/message/moderation/executeAutomodAction";
import { getRoomMembershipWhere } from "@@/server/services/room/getRoomMembershipWhere";
import { createMockContext, getMockSession } from "@@/server/trpc/context.test";
import { roomsInMessage, usersToRoomsInMessage, WordFilterAction } from "@esposter/db-schema";
import { takeOne } from "@esposter/shared";
import { MockTableDatabase } from "azure-mock";
import { afterEach, beforeAll, beforeEach, describe, expect, test, vi } from "vitest";

describe(executeAutomodAction, () => {
  let mockContext: Context;
  const name = "name";
  const timeoutDurationMs = 1;

  beforeAll(async () => {
    mockContext = await createMockContext();
  });

  // Pinned at the epoch, so a timeout one step past the automod's stays strictly longer than it
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
      await mockContext.db.select().from(usersToRoomsInMessage).where(getRoomMembershipWhere(roomId, userId)),
    );
    return membership.timeoutUntil;
  };

  test("does not shorten a longer existing timeout", async () => {
    expect.hasAssertions();

    const { roomId, userId } = await setupMembership();
    const existingTimeoutUntil = new Date(timeoutDurationMs + 1);
    await mockContext.db
      .update(usersToRoomsInMessage)
      .set({ timeoutUntil: existingTimeoutUntil })
      .where(getRoomMembershipWhere(roomId, userId));
    await executeAutomodAction(mockContext.db, { action: WordFilterAction.Timeout, roomId, timeoutDurationMs, userId });

    await expect(readTimeoutUntil(roomId, userId)).resolves.toStrictEqual(existingTimeoutUntil);
  });

  test("sets a null existing timeout to the new value", async () => {
    expect.hasAssertions();

    const { roomId, userId } = await setupMembership();
    await executeAutomodAction(mockContext.db, { action: WordFilterAction.Timeout, roomId, timeoutDurationMs, userId });

    await expect(readTimeoutUntil(roomId, userId)).resolves.toStrictEqual(new Date(timeoutDurationMs));
  });

  test("extends an expired existing timeout to the new value", async () => {
    expect.hasAssertions();

    const { roomId, userId } = await setupMembership();
    await mockContext.db
      .update(usersToRoomsInMessage)
      .set({ timeoutUntil: new Date(0) })
      .where(getRoomMembershipWhere(roomId, userId));
    await executeAutomodAction(mockContext.db, { action: WordFilterAction.Timeout, roomId, timeoutDurationMs, userId });

    await expect(readTimeoutUntil(roomId, userId)).resolves.toStrictEqual(new Date(timeoutDurationMs));
  });
});
