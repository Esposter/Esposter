import type { Database } from "@esposter/db-schema";

import { removeAccountFromMemberRooms } from "#src/services/account/removeAccountFromMemberRooms";
import { clearRoomObjectCalls, roomObjectCalls } from "#src/services/room/getRoomObject.test";
import { createUser } from "#src/services/shared/createUser.test";
import { createMockDb } from "@esposter/db-mock";
import { roomsInMessage, usersInAuth, usersToRoomsInMessage } from "@esposter/db-schema";
import { takeOne } from "@esposter/shared";
import { v7 } from "uuid";
import { afterEach, beforeAll, describe, expect, test, vi } from "vitest";

let mockDb: Database;

vi.mock(import("#src/services/shared/db"), () => ({
  get db() {
    return mockDb;
  },
}));
vi.mock(import("#src/services/room/getRoomObject"), () => import("#src/services/room/getRoomObject.test"));

describe(removeAccountFromMemberRooms, () => {
  const name = "name";

  beforeAll(async () => {
    mockDb = (await createMockDb()).db;
  });

  afterEach(async () => {
    clearRoomObjectCalls();
    await mockDb.delete(usersInAuth);
  });

  test("removes the account from a room it is in, then asks that room to tell its online members it has left", async () => {
    expect.hasAssertions();

    const userId = v7();
    const otherUserId = v7();
    await mockDb.insert(usersInAuth).values([createUser(userId), createUser(otherUserId)]);
    const room = takeOne(await mockDb.insert(roomsInMessage).values({ name, userId: otherUserId }).returning());
    await mockDb.insert(usersToRoomsInMessage).values([
      { roomId: room.id, userId },
      { roomId: room.id, userId: otherUserId },
    ]);

    await removeAccountFromMemberRooms(userId);

    expect(roomObjectCalls).toStrictEqual([
      { args: [userId], method: "removeMember", roomId: room.id },
      {
        args: [{ data: { roomId: room.id, userId }, type: "leaveRoom" }],
        method: "notifyOnlineMembers",
        roomId: room.id,
      },
    ]);
  });
});
