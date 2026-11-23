import type { Database } from "@esposter/db-schema";

import { deleteAccountOwnedRooms } from "#src/services/account/deleteAccountOwnedRooms";
import { getReaderWakes, MockPublishedTopics } from "#src/services/realtime/publishTopics.test";
import { runUnit } from "#src/services/shared/runUnit";
import { readBlobNames } from "#src/services/storage/readBlobNames.test";
import { seedBlob } from "#src/services/storage/seedBlob.test";
import { getMemberRoomIds } from "@esposter/db";
import { createMockDb } from "@esposter/db-mock";
import {
  clearMockBuckets,
  clearRoomObjectCalls,
  clearUserObjectCalls,
  createUser,
  disposeMockBuckets,
  openMockBuckets,
  roomObjectCalls,
  userObjectCalls,
} from "@esposter/db-mock/workers";
import {
  AdminActionType,
  getScopeTopic,
  moderationLogsInMessage,
  moderationNotesInMessage,
  roomsInMessage,
  StorageBucket,
  usersInAuth,
  usersToRoomsInMessage,
} from "@esposter/db-schema";
import { takeOne } from "@esposter/shared";
import { getTableName } from "drizzle-orm";
import { v7 } from "uuid";
import { afterAll, afterEach, beforeAll, describe, expect, test, vi } from "vitest";

vi.mock(import("#src/services/storage/getBucket"), () => import("@esposter/db-mock/workers"));
vi.mock(import("#src/services/room/getRoomObject"), () => import("@esposter/db-mock/workers"));
vi.mock(import("#src/services/user/getUserObject"), () => import("@esposter/db-mock/workers"));

describe(deleteAccountOwnedRooms, () => {
  let mockDb: Database;

  const name = "name";
  const note = "note";

  beforeAll(async () => {
    mockDb = (await createMockDb()).db;
    await openMockBuckets([StorageBucket.MessageAssets, StorageBucket.PublicUserAssets]);
  });

  afterEach(async () => {
    MockPublishedTopics.length = 0;
    await clearMockBuckets();
    clearRoomObjectCalls();
    clearUserObjectCalls();
    await mockDb.delete(usersInAuth);
  });

  afterAll(async () => {
    await disposeMockBuckets();
  });

  test("asks an owned room's object to delete everything, deletes its attachments, moderation records and row, and no other owner's room", async () => {
    expect.hasAssertions();

    const userId = v7();
    const otherUserId = v7();
    const fileId = v7();
    await mockDb.insert(usersInAuth).values([createUser(userId), createUser(otherUserId)]);
    const ownedRoom = takeOne(await mockDb.insert(roomsInMessage).values({ name, userId }).returning());
    const otherRoom = takeOne(await mockDb.insert(roomsInMessage).values({ name, userId: otherUserId }).returning());
    await mockDb.insert(usersToRoomsInMessage).values({ roomId: ownedRoom.id, userId: otherUserId });
    // The moderation log and notes are rows of the room, so they go with its row rather than with a partition sweep
    await mockDb.insert(moderationLogsInMessage).values([
      { actorUserId: userId, roomId: ownedRoom.id, targetUserId: otherUserId, type: AdminActionType.Warn },
      { actorUserId: userId, roomId: otherRoom.id, targetUserId: otherUserId, type: AdminActionType.Warn },
    ]);
    await mockDb.insert(moderationNotesInMessage).values([
      { actorUserId: userId, note, roomId: ownedRoom.id, targetUserId: otherUserId },
      { actorUserId: userId, note, roomId: otherRoom.id, targetUserId: otherUserId },
    ]);
    await seedBlob(StorageBucket.MessageAssets, `${ownedRoom.id}/${fileId}`);
    await seedBlob(StorageBucket.MessageAssets, `${otherRoom.id}/${fileId}`);
    await seedBlob(StorageBucket.PublicUserAssets, `rooms/${ownedRoom.id}/ProfileImage`);
    await seedBlob(StorageBucket.PublicUserAssets, `rooms/${otherRoom.id}/ProfileImage`);

    await runUnit(() => deleteAccountOwnedRooms(userId));

    expect(roomObjectCalls).toStrictEqual([{ args: [[otherUserId]], method: "deleteAll", objectId: ownedRoom.id }]);
    await expect(
      mockDb.select({ roomId: moderationLogsInMessage.roomId }).from(moderationLogsInMessage),
    ).resolves.toStrictEqual([{ roomId: otherRoom.id }]);
    await expect(
      mockDb.select({ roomId: moderationNotesInMessage.roomId }).from(moderationNotesInMessage),
    ).resolves.toStrictEqual([{ roomId: otherRoom.id }]);
    await expect(readBlobNames(StorageBucket.MessageAssets)).resolves.toStrictEqual([`${otherRoom.id}/${fileId}`]);
    await expect(readBlobNames(StorageBucket.PublicUserAssets)).resolves.toStrictEqual([
      `rooms/${otherRoom.id}/ProfileImage`,
    ]);
    await expect(mockDb.select({ id: roomsInMessage.id }).from(roomsInMessage)).resolves.toStrictEqual([
      { id: otherRoom.id },
    ]);
  });

  // A member's membership is a row of the room, so the room's row takes it out with the room, and the member's list of rooms
  // Is woken by that removal, not by a topic the sweep names
  test("wakes the membership reader of each member whose membership the owned room's row takes out", async () => {
    expect.hasAssertions();

    const userId = v7();
    const memberUserId = v7();
    await mockDb.insert(usersInAuth).values([createUser(userId), createUser(memberUserId)]);
    const ownedRoom = takeOne(await mockDb.insert(roomsInMessage).values({ name, userId }).returning());
    await mockDb.insert(usersToRoomsInMessage).values({ roomId: ownedRoom.id, userId: memberUserId });
    MockPublishedTopics.length = 0;

    await runUnit(() => deleteAccountOwnedRooms(userId));

    await expect(getReaderWakes(mockDb, (database) => getMemberRoomIds(database, memberUserId))).resolves.toContain(
      getScopeTopic(getTableName(usersToRoomsInMessage), "userId", memberUserId),
    );
  });

  test("tombstones each member's membership in an owned room and sends the tombstone to that member's object", async () => {
    expect.hasAssertions();

    const userId = v7();
    const memberUserId = v7();
    await mockDb.insert(usersInAuth).values([createUser(userId), createUser(memberUserId)]);
    const ownedRoom = takeOne(await mockDb.insert(roomsInMessage).values({ name, userId }).returning());
    await mockDb.insert(usersToRoomsInMessage).values({ roomId: ownedRoom.id, userId: memberUserId });

    await runUnit(() => deleteAccountOwnedRooms(userId));

    expect(userObjectCalls).toStrictEqual([
      {
        args: [expect.objectContaining({ deletedAt: expect.any(Date), roomId: ownedRoom.id, userId: memberUserId })],
        method: "updateUserToRoom",
        objectId: memberUserId,
      },
    ]);
  });
});
