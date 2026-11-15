import type { Database } from "@esposter/db-schema";

import { deleteAccountOwnedRooms } from "#src/services/account/deleteAccountOwnedRooms";
import { clearRoomObjectCalls, roomObjectCalls } from "#src/services/room/getRoomObject.test";
import { createUser } from "#src/services/shared/createUser.test";
import { clearMockBuckets, disposeMockBuckets, openMockBuckets } from "#src/services/storage/getBucket.test";
import { readBlobNames } from "#src/services/storage/readBlobNames.test";
import { seedBlob } from "#src/services/storage/seedBlob.test";
import { createMockDb } from "@esposter/db-mock";
import {
  AdminActionType,
  moderationLogsInMessage,
  moderationNotesInMessage,
  roomsInMessage,
  StorageBucket,
  usersInAuth,
} from "@esposter/db-schema";
import { takeOne } from "@esposter/shared";
import { v7 } from "uuid";
import { afterAll, afterEach, beforeAll, describe, expect, test, vi } from "vitest";

let mockDb: Database;

vi.mock(import("#src/services/shared/db"), () => ({
  get db() {
    return mockDb;
  },
}));
vi.mock(import("#src/services/storage/getBucket"), () => import("#src/services/storage/getBucket.test"));
vi.mock(import("#src/services/room/getRoomObject"), () => import("#src/services/room/getRoomObject.test"));

describe(deleteAccountOwnedRooms, () => {
  const name = "name";
  const note = "note";

  beforeAll(async () => {
    mockDb = (await createMockDb()).db;
    await openMockBuckets([StorageBucket.MessageAssets, StorageBucket.PublicUserAssets]);
  });

  afterEach(async () => {
    await clearMockBuckets();
    clearRoomObjectCalls();
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

    await deleteAccountOwnedRooms(userId);

    expect(roomObjectCalls).toStrictEqual([{ args: [{ userId }], method: "deleteAll", roomId: ownedRoom.id }]);
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
});
