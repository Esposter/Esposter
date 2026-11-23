import type { Database } from "@esposter/db-schema";

import { removeAccountFromMemberRooms } from "#src/services/account/removeAccountFromMemberRooms";
import { createMockDb } from "@esposter/db-mock";
import { clearRoomObjectCalls, createUser, roomObjectCalls, roomObjectReplies } from "@esposter/db-mock/workers";
import { roomsInMessage, usersInAuth, usersToRoomsInMessage } from "@esposter/db-schema";
import { takeOne } from "@esposter/shared";
import { v7 } from "uuid";
import { afterEach, assert, beforeAll, describe, expect, test, vi } from "vitest";

let mockDb: Database;

vi.mock(import("#src/services/shared/getDb"), () => ({
  getDb() {
    return mockDb;
  },
}));
vi.mock(import("#src/services/room/getRoomObject"), () => import("@esposter/db-mock/workers"));

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
    const removedMembership = await mockDb.query.usersToRoomsInMessage.findFirst({
      where: { roomId: { eq: room.id }, userId: { eq: userId } },
    });

    assert.exists(removedMembership);
    expect(removedMembership.deletedAt).not.toBeNull();
    expect(roomObjectCalls).toStrictEqual([
      { args: [userId], method: "removeMember", objectId: room.id },
      {
        args: [
          {
            data: {
              deletedAt: removedMembership.deletedAt,
              displayName: removedMembership.displayName,
              roomId: room.id,
              userId,
              version: removedMembership.version,
            },
            type: "leaveRoom",
          },
        ],
        method: "notifyOnlineMembers",
        objectId: room.id,
      },
    ]);
  });

  test("a room whose removal fails is logged, and the account is still removed from the rooms after it", async () => {
    expect.hasAssertions();

    const userId = v7();
    const otherUserId = v7();
    await mockDb.insert(usersInAuth).values([createUser(userId), createUser(otherUserId)]);
    const failingRoom = takeOne(await mockDb.insert(roomsInMessage).values({ name, userId: otherUserId }).returning());
    const room = takeOne(await mockDb.insert(roomsInMessage).values({ name, userId: otherUserId }).returning());
    await mockDb.insert(usersToRoomsInMessage).values([
      { roomId: failingRoom.id, userId },
      { roomId: room.id, userId },
    ]);
    const error = new Error(" ");
    roomObjectReplies.set("removeMember", (_args, objectId) =>
      objectId === failingRoom.id ? Promise.reject(error) : undefined,
    );
    const errorSpy = vi.spyOn(console, "error");

    await removeAccountFromMemberRooms(userId);

    expect(errorSpy).toHaveBeenCalledExactlyOnceWith("An erased account's room state failed to clear", {
      error,
      roomId: failingRoom.id,
      userId,
    });
    expect(
      roomObjectCalls.filter(({ objectId }) => objectId === failingRoom.id).map(({ method }) => method),
    ).toStrictEqual(["removeMember", "notifyOnlineMembers"]);
    expect(roomObjectCalls.filter(({ objectId }) => objectId === room.id).map(({ method }) => method)).toStrictEqual([
      "removeMember",
      "notifyOnlineMembers",
    ]);
  });
});
