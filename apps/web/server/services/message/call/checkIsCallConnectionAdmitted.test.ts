import type { Context } from "#server/trpc/context";

import { checkIsCallConnectionAdmitted } from "#server/services/message/call/checkIsCallConnectionAdmitted";
import { createCallSessionId } from "#server/services/message/call/createCallSessionId";
import { createCallerFactory } from "#server/trpc";
import { createMockContext, getMockSession } from "#server/trpc/context.test";
import { roomRouter } from "#server/trpc/routers/room";
import { roomsInMessage, usersToRoomsInMessage } from "@esposter/db-schema";
import { afterEach, beforeAll, describe, expect, test, vi } from "vitest";

describe(checkIsCallConnectionAdmitted, () => {
  let mockContext: Context;
  const name = "name";
  const createRoomCallSessionId = async () => {
    const room = await createCallerFactory(roomRouter)(mockContext).createRoom({ name });
    const userId = getMockSession().user.id;
    return { callSessionId: await createCallSessionId(mockContext.db, room.id, userId), roomId: room.id, userId };
  };

  beforeAll(async () => {
    mockContext = await createMockContext();
  });

  afterEach(async () => {
    vi.useRealTimers();
    await mockContext.db.delete(roomsInMessage);
  });

  test("admits a member of the call's room", async () => {
    expect.hasAssertions();

    const { callSessionId, userId } = await createRoomCallSessionId();

    await expect(checkIsCallConnectionAdmitted(mockContext.db, callSessionId, userId)).resolves.toBe(true);
  });

  // LiveKit lets a removed participant rejoin on the token it still holds, so the connection is where the room's
  // Door is asked again
  test("refuses a connection whose membership was removed", async () => {
    expect.hasAssertions();

    const { callSessionId, userId } = await createRoomCallSessionId();
    await mockContext.db.delete(usersToRoomsInMessage);

    await expect(checkIsCallConnectionAdmitted(mockContext.db, callSessionId, userId)).resolves.toBe(false);
  });

  // The clock is pinned so "timed out until 1ms from now" is still true by the time the door is asked
  test("refuses a connection timed out of the room", async () => {
    expect.hasAssertions();

    vi.useFakeTimers({ now: 0, toFake: ["Date"] });
    const { callSessionId, userId } = await createRoomCallSessionId();
    await mockContext.db.update(usersToRoomsInMessage).set({ timeoutUntil: new Date(Date.now() + 1) });

    await expect(checkIsCallConnectionAdmitted(mockContext.db, callSessionId, userId)).resolves.toBe(false);
  });
});
