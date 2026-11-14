import type { Database } from "@esposter/db-schema";

import { deleteAccountMemberRoomReactions } from "#src/services/account/deleteAccountMemberRoomReactions";
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

describe(deleteAccountMemberRoomReactions, () => {
  const name = "name";

  beforeAll(async () => {
    mockDb = (await createMockDb()).db;
  });

  afterEach(async () => {
    clearRoomObjectCalls();
    await mockDb.delete(usersInAuth);
  });

  test("asks each room the account is a member of to delete its reactions, and no room it is not in", async () => {
    expect.hasAssertions();

    const userId = v7();
    const otherUserId = v7();
    await mockDb.insert(usersInAuth).values([createUser(userId), createUser(otherUserId)]);
    const memberRoom = takeOne(await mockDb.insert(roomsInMessage).values({ name, userId: otherUserId }).returning());
    // A room the account is not in, with another person in it
    await mockDb.insert(roomsInMessage).values({ name, userId: otherUserId });
    await mockDb.insert(usersToRoomsInMessage).values([
      { roomId: memberRoom.id, userId },
      { roomId: memberRoom.id, userId: otherUserId },
    ]);

    await deleteAccountMemberRoomReactions(userId);

    expect(roomObjectCalls).toStrictEqual([{ args: [userId], method: "deleteUserReactions", roomId: memberRoom.id }]);
  });
});
