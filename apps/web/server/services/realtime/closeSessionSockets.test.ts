import type { useCallObject } from "#server/composables/realtime/useCallObject";
import type { useRoomObject } from "#server/composables/realtime/useRoomObject";
import type { useUserObject } from "#server/composables/realtime/useUserObject";
import type { MockDatabase } from "@esposter/db-mock";
import type { CallObjectRpc, Database, RoomObjectRpc, UserObjectRpc } from "@esposter/db-schema";

import { closeSessionSockets } from "#server/services/realtime/closeSessionSockets";
import { createMockDb } from "@esposter/db-mock";
import { roomsInMessage, usersInAuth, usersToRoomsInMessage } from "@esposter/db-schema";
import { noop, takeOne } from "@esposter/shared";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, test, vi } from "vitest";

// Each object a revoked session reaches is faked, so a test reads which of them were asked to close the session
const { callObject, roomObject, userObject } = vi.hoisted(() => ({
  callObject: { closeSession: vi.fn<CallObjectRpc["closeSession"]>() },
  roomObject: { closeSession: vi.fn<RoomObjectRpc["closeSession"]>() },
  userObject: {
    closeSession: vi.fn<UserObjectRpc["closeSession"]>(),
    readJoinedCallIds: vi.fn<UserObjectRpc["readJoinedCallIds"]>(),
  },
}));
vi.mock(import("#server/composables/realtime/useCallObject"), () => ({
  useCallObject: () => callObject as unknown as ReturnType<typeof useCallObject>,
}));
vi.mock(import("#server/composables/realtime/useRoomObject"), () => ({
  useRoomObject: () => roomObject as unknown as ReturnType<typeof useRoomObject>,
}));
vi.mock(import("#server/composables/realtime/useUserObject"), () => ({
  useUserObject: () => userObject as unknown as ReturnType<typeof useUserObject>,
}));

describe(closeSessionSockets, () => {
  const name = "name";
  const sessionId = "session-abcdefghijklmnop";
  const ownerId = "5b8f2c1e-7a3d-7d4e-9f60-1a2b3c4d5e66";
  const userId = "8f1c6a2e-4b7d-7e9a-8c31-2d5f7a9b0c11";

  let db: Database;
  let mockDatabase: MockDatabase;

  beforeAll(async () => {
    mockDatabase = await createMockDb();
    db = mockDatabase.db;
  });

  beforeEach(() => {
    userObject.readJoinedCallIds.mockResolvedValue([]);
    userObject.closeSession.mockResolvedValue(undefined);
    roomObject.closeSession.mockResolvedValue(undefined);
  });

  afterEach(async () => {
    vi.restoreAllMocks();
    await mockDatabase.reset();
  });

  afterAll(async () => {
    await mockDatabase.dispose();
  });

  test("a failed read of the person's joined calls still closes the session on their object and on each room they are in", async () => {
    expect.hasAssertions();

    await db.insert(usersInAuth).values([
      { email: "owner@example.com", emailVerified: false, id: ownerId, name },
      { email: "user@example.com", emailVerified: false, id: userId, name },
    ]);
    const room = takeOne(await db.insert(roomsInMessage).values({ name, userId: ownerId }).returning());
    await db.insert(usersToRoomsInMessage).values({ roomId: room.id, userId });
    const readError = new Error("read failed");
    userObject.readJoinedCallIds.mockRejectedValueOnce(readError);
    const consoleError = vi.spyOn(console, "error").mockImplementation(noop);

    await closeSessionSockets(db, userId, sessionId);

    expect(userObject.closeSession).toHaveBeenCalledExactlyOnceWith(sessionId);
    expect(roomObject.closeSession).toHaveBeenCalledExactlyOnceWith(sessionId);
    expect(consoleError).toHaveBeenCalledExactlyOnceWith("Joined calls failed to read for a revoked session", {
      error: readError,
      sessionId,
      userId,
    });
  });
});
