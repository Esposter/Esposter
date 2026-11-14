import type { Database } from "@esposter/db-schema";

import { deleteAccountOwnedRooms } from "#src/services/account/deleteAccountOwnedRooms";
import { readBlobNames } from "#src/services/azure/readBlobNames.test";
import { seedBlob } from "#src/services/azure/seedBlob.test";
import { createOnlineStatus } from "#src/services/room/createOnlineStatus.test";
import {
  clearMockRooms,
  getRoomObject,
  openMockRooms,
  readMockRoomTableNames,
} from "#src/services/room/getRoomObject.test";
import { createUser } from "#src/services/shared/createUser.test";
import { clearMockBuckets, disposeMockBuckets, openMockBuckets } from "#src/services/storage/getBucket.test";
import { userObjectCalls } from "#src/services/user/getUserObject.test";
import { createMockDb } from "@esposter/db-mock";
import {
  AdminActionType,
  MessageType,
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
  const message = "message";
  const name = "name";
  const note = "note";

  beforeAll(async () => {
    mockDb = (await createMockDb()).db;
    await openMockRooms();
    await openMockBuckets([StorageBucket.MessageAssets, StorageBucket.PublicUserAssets]);
  });

  afterEach(async () => {
    await clearMockBuckets();
    clearMockRooms();
    await mockDb.delete(usersInAuth);
  });

  afterAll(async () => {
    await disposeMockBuckets();
  });

  test("deletes an owned room's object, moderation records, attachments and row, and no other owner's room", async () => {
    expect.hasAssertions();

    const userId = v7();
    const otherUserId = v7();
    const fileId = v7();
    await mockDb.insert(usersInAuth).values([createUser(userId), createUser(otherUserId)]);
    const ownedRoom = takeOne(await mockDb.insert(roomsInMessage).values({ name, userId }).returning());
    const otherRoom = takeOne(await mockDb.insert(roomsInMessage).values({ name, userId: otherUserId }).returning());
    await getRoomObject(ownedRoom.id).createMessage({ message, type: MessageType.Message }, { userId: otherUserId });
    const otherRoomMessage = await getRoomObject(otherRoom.id).createMessage(
      { message, type: MessageType.Message },
      { userId: otherUserId },
    );
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
    // The owned room's object holds tables before the deletion, so the check that it holds none after is not vacuous
    expect(readMockRoomTableNames(ownedRoom.id)).not.toStrictEqual([]);

    await deleteAccountOwnedRooms(userId);

    expect(readMockRoomTableNames(ownedRoom.id)).toStrictEqual([]);
    expect(getRoomObject(otherRoom.id).readMessages({ limit: 10 })).toStrictEqual([otherRoomMessage]);
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

  test("an owned room's members who are online are told it is deleted, before its object is emptied", async () => {
    expect.hasAssertions();

    const userId = v7();
    const memberUserId = v7();
    await mockDb.insert(usersInAuth).values([createUser(userId), createUser(memberUserId)]);
    const ownedRoom = takeOne(await mockDb.insert(roomsInMessage).values({ name, userId }).returning());
    await getRoomObject(ownedRoom.id).attachMember(memberUserId, createOnlineStatus(memberUserId));
    userObjectCalls.length = 0;

    await deleteAccountOwnedRooms(userId);

    expect(userObjectCalls).toStrictEqual([
      {
        args: [{ data: { roomId: ownedRoom.id, userId }, type: "deleteRoom" }],
        method: "broadcastEvent",
        userId: memberUserId,
      },
    ]);
  });
});
