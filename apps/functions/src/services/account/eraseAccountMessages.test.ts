import type { Database } from "@esposter/db-schema";

import { eraseAccountMessages } from "#src/services/account/eraseAccountMessages";
import { readBlobNames } from "#src/services/azure/readBlobNames.test";
import { seedBlob } from "#src/services/azure/seedBlob.test";
import { createUser } from "#src/services/shared/createUser.test";
import { clearMockBuckets, disposeMockBuckets, openMockBuckets } from "#src/services/storage/getBucket.test";
import { clearMockRooms, getRoomObject, openMockRooms } from "#src/services/room/getRoomObject.test";
import { getFileBlobNames } from "@esposter/db";
import { createMockDb } from "@esposter/db-mock";
import { MessageType, roomsInMessage, StorageBucket, usersInAuth, usersToRoomsInMessage } from "@esposter/db-schema";
import { takeOne } from "@esposter/shared";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, test, vi } from "vitest";

let mockDb: Database;

vi.mock(import("#src/services/shared/db"), () => ({
  get db() {
    return mockDb;
  },
}));
vi.mock(import("#src/services/storage/getBucket"), () => import("#src/services/storage/getBucket.test"));
vi.mock(import("#src/services/room/getRoomObject"), () => import("#src/services/room/getRoomObject.test"));
vi.mock(import("#src/services/server/publishToServer"), () => import("#src/services/server/publishToServer.test"));

describe(eraseAccountMessages, () => {
  const filename = "filename";
  const message = "message";
  const name = "name";
  const createFile = () => ({
    filename,
    hasThumbnail: false,
    id: crypto.randomUUID(),
    isSpoiler: false,
    mimetype: "mimetype",
    size: 0,
  });

  beforeAll(async () => {
    mockDb = (await createMockDb()).db;
    await openMockRooms();
    await openMockBuckets([StorageBucket.MessageAssets]);
  });

  // Every timestamp the room object writes comes from `new Date()`, so a frozen clock is what lets them be asserted exactly
  beforeEach(() => {
    vi.useFakeTimers({ now: 0, toFake: ["Date"] });
  });

  afterEach(async () => {
    vi.useRealTimers();
    await clearMockBuckets();
    clearMockRooms();
    await mockDb.delete(usersInAuth);
  });

  afterAll(async () => {
    await disposeMockBuckets();
  });

  test("erases the account's messages and scheduled messages in the rooms it is a member of, with their files' blobs, and nothing else", async () => {
    expect.hasAssertions();

    const userId = crypto.randomUUID();
    const otherUserId = crypto.randomUUID();
    await mockDb.insert(usersInAuth).values([createUser(userId), createUser(otherUserId)]);
    const memberRoom = takeOne(await mockDb.insert(roomsInMessage).values({ name, userId: otherUserId }).returning());
    const nonMemberRoom = takeOne(
      await mockDb.insert(roomsInMessage).values({ name, userId: otherUserId }).returning(),
    );
    await mockDb.insert(usersToRoomsInMessage).values([
      { roomId: memberRoom.id, userId },
      { roomId: memberRoom.id, userId: otherUserId },
    ]);

    const memberRoomObject = getRoomObject(memberRoom.id);
    const targetFile = createFile();
    const otherUserFile = createFile();
    await memberRoomObject.createMessage({ files: [targetFile], message, type: MessageType.Message }, { userId });
    const otherUserMessage = await memberRoomObject.createMessage(
      { files: [otherUserFile], message, type: MessageType.Message },
      { userId: otherUserId },
    );
    const nonMemberRoomMessage = await getRoomObject(nonMemberRoom.id).createMessage(
      { message, type: MessageType.Message },
      { userId },
    );
    await seedBlob(StorageBucket.MessageAssets, getFileBlobNames(memberRoom.id, targetFile.id, filename).blobName);
    const otherUserBlobName = getFileBlobNames(memberRoom.id, otherUserFile.id, filename).blobName;
    await seedBlob(StorageBucket.MessageAssets, otherUserBlobName);

    const scheduledMessage = { message, runAt: new Date(1) };
    await memberRoomObject.createScheduledMessage({ ...scheduledMessage, id: crypto.randomUUID() }, { userId });
    const otherUserScheduledMessage = await memberRoomObject.createScheduledMessage(
      { ...scheduledMessage, id: crypto.randomUUID() },
      { userId: otherUserId },
    );
    const nonMemberScheduledMessage = await getRoomObject(nonMemberRoom.id).createScheduledMessage(
      { ...scheduledMessage, id: crypto.randomUUID() },
      { userId },
    );

    await eraseAccountMessages(userId);

    expect(memberRoomObject.readMessages({ limit: 10 })).toStrictEqual([otherUserMessage]);
    expect(memberRoomObject.readScheduledMessages(userId)).toStrictEqual([]);
    expect(memberRoomObject.readScheduledMessages(otherUserId)).toStrictEqual([otherUserScheduledMessage]);
    expect(getRoomObject(nonMemberRoom.id).readMessages({ limit: 10 })).toStrictEqual([nonMemberRoomMessage]);
    expect(getRoomObject(nonMemberRoom.id).readScheduledMessages(userId)).toStrictEqual([nonMemberScheduledMessage]);
    await expect(readBlobNames(StorageBucket.MessageAssets)).resolves.toStrictEqual([otherUserBlobName]);
  });
});
