import type { Database } from "@esposter/db-schema";

import { removeAccountFromMemberRooms } from "#src/services/account/removeAccountFromMemberRooms";
import { createSocket } from "#src/services/durableObject/createMockObjectState.test";
import { ROOM_MEMBER_REMOVED_CODE } from "#src/services/room/constants";
import { createOnlineStatus } from "#src/services/room/createOnlineStatus.test";
import { acceptRoomSocket, clearMockRooms, getRoomObject, openMockRooms } from "#src/services/room/getRoomObject.test";
import { createUser } from "#src/services/shared/createUser.test";
import { userObjectCalls } from "#src/services/user/getUserObject.test";
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
    await openMockRooms();
  });

  afterEach(async () => {
    clearMockRooms();
    userObjectCalls.length = 0;
    await mockDb.delete(usersInAuth);
  });

  test("drops the account's sockets in a room it is in, and tells the members still online that it has left", async () => {
    expect.hasAssertions();

    const userId = v7();
    const otherUserId = v7();
    await mockDb.insert(usersInAuth).values([createUser(userId), createUser(otherUserId)]);
    const room = takeOne(await mockDb.insert(roomsInMessage).values({ name, userId: otherUserId }).returning());
    await mockDb.insert(usersToRoomsInMessage).values([
      { roomId: room.id, userId },
      { roomId: room.id, userId: otherUserId },
    ]);
    const roomObject = getRoomObject(room.id);
    const erasedSocket = createSocket();
    acceptRoomSocket(room.id, erasedSocket, [`user:${userId}`]);
    await Promise.all(
      [userId, otherUserId].map((memberId) => roomObject.attachMember(memberId, createOnlineStatus(memberId))),
    );
    userObjectCalls.length = 0;

    await removeAccountFromMemberRooms(userId);

    expect(erasedSocket.close).toHaveBeenCalledExactlyOnceWith(ROOM_MEMBER_REMOVED_CODE, "Removed from the room");
    expect(userObjectCalls).toStrictEqual([
      {
        args: [{ data: { roomId: room.id, userId }, type: "leaveRoom" }],
        method: "broadcastEvent",
        userId: otherUserId,
      },
    ]);
  });
});
