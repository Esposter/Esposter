import type { Database, RoomMessage, ScheduledRoomMessage } from "@esposter/db-schema";

import { eraseAccountMessages } from "#src/services/account/eraseAccountMessages";
import { readBlobNames } from "#src/services/azure/readBlobNames.test";
import { seedBlob } from "#src/services/azure/seedBlob.test";
import { clearRoomObjectCalls, roomObjectCalls, roomObjectReplies } from "#src/services/room/getRoomObject.test";
import { createUser } from "#src/services/shared/createUser.test";
import { clearMockBuckets, disposeMockBuckets, openMockBuckets } from "#src/services/storage/getBucket.test";
import { getFileBlobNames } from "@esposter/db";
import { createMockDb } from "@esposter/db-mock";
import { MessageType, roomsInMessage, StorageBucket, usersInAuth, usersToRoomsInMessage } from "@esposter/db-schema";
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

describe(eraseAccountMessages, () => {
  const filename = "filename";
  const message = "message";
  const name = "name";
  const createFile = () => ({
    filename,
    hasThumbnail: false,
    id: v7(),
    isSpoiler: false,
    mimetype: "mimetype",
    size: 0,
  });

  beforeAll(async () => {
    mockDb = (await createMockDb()).db;
    await openMockBuckets([StorageBucket.MessageAssets]);
  });

  afterEach(async () => {
    await clearMockBuckets();
    clearRoomObjectCalls();
    await mockDb.delete(usersInAuth);
  });

  afterAll(async () => {
    await disposeMockBuckets();
  });

  test("asks each room the account is a member of to erase its messages and scheduled messages, and deletes only the blobs of the files it erased", async () => {
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

    // The erased message's file goes with it. The other person's file is in no message the account erased.
    // Its blob is never named by the erase, so it stays
    const targetFile = createFile();
    const otherUserFile = createFile();
    const erasedMessage: RoomMessage = {
      appUserId: null,
      appUserImage: "",
      createdAt: new Date(0),
      deletedAt: null,
      files: [targetFile],
      id: 1,
      isEdited: false,
      isForward: false,
      isPinned: false,
      linkPreviewResponse: null,
      mentions: [],
      message,
      replyToId: null,
      senderName: null,
      type: MessageType.Message,
      updatedAt: new Date(0),
      userId,
    };
    const scheduledMessage: ScheduledRoomMessage = { id: v7(), message, replyToId: null, runAt: new Date(0), userId };
    roomObjectReplies.set("deleteUserMessages", () => [erasedMessage]);
    roomObjectReplies.set("readScheduledMessages", () => [scheduledMessage]);
    await seedBlob(StorageBucket.MessageAssets, getFileBlobNames(memberRoom.id, targetFile.id, filename).blobName);
    const otherUserBlobName = getFileBlobNames(memberRoom.id, otherUserFile.id, filename).blobName;
    await seedBlob(StorageBucket.MessageAssets, otherUserBlobName);

    await eraseAccountMessages(userId);

    expect(roomObjectCalls).toStrictEqual([
      { args: [userId], method: "deleteUserMessages", roomId: memberRoom.id },
      { args: [userId], method: "readScheduledMessages", roomId: memberRoom.id },
      { args: [scheduledMessage.id, { userId }], method: "deleteScheduledMessage", roomId: memberRoom.id },
    ]);
    await expect(readBlobNames(StorageBucket.MessageAssets)).resolves.toStrictEqual([otherUserBlobName]);
  });
});
