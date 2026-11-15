import type { Database, RoomMessage } from "@esposter/db-schema";

import { exportUserDataHandler } from "#src/handlers/exportUserDataHandler";
import { MockPublishedTopics } from "#src/services/realtime/publishTopics.test";
import { clearRoomObjectCalls, roomObjectReplies } from "#src/services/room/getRoomObject.test";
import { createUser } from "#src/services/shared/createUser.test";
import { clearMockBuckets, disposeMockBuckets, openMockBuckets } from "#src/services/storage/getBucket.test";
import { readBlobNames } from "#src/services/storage/readBlobNames.test";
import { getDataExportBlobName } from "#src/services/user/getDataExportBlobName";
import { createMockDb } from "@esposter/db-mock";
import {
  dataExportsInUser,
  DataExportStatus,
  getTopic,
  MessageType,
  resourcesInResource,
  ResourceType,
  resourceWorkingAssetsInResource,
  roomsInMessage,
  StorageBucket,
  TopicKind,
  usersInAuth,
  usersToRoomsInMessage,
} from "@esposter/db-schema";
import { takeOne } from "@esposter/shared";
import { eq } from "drizzle-orm";
import { v7 } from "uuid";
import { afterAll, afterEach, assert, beforeAll, describe, expect, test, vi } from "vitest";

let mockDb: Database;

vi.mock(import("#src/services/shared/db"), () => ({
  get db() {
    return mockDb;
  },
}));
vi.mock(import("#src/services/storage/getBucket"), () => import("#src/services/storage/getBucket.test"));
vi.mock(import("#src/services/room/getRoomObject"), () => import("#src/services/room/getRoomObject.test"));
vi.mock(import("#src/services/realtime/publishTopics"), () => import("#src/services/realtime/publishTopics.test"));

const readExportRow = async (dataExportId: string) =>
  takeOne(
    await mockDb
      .select({
        blobName: dataExportsInUser.blobName,
        expiresAt: dataExportsInUser.expiresAt,
        failureReason: dataExportsInUser.failureReason,
        readyAt: dataExportsInUser.readyAt,
        status: dataExportsInUser.status,
      })
      .from(dataExportsInUser)
      .where(eq(dataExportsInUser.id, dataExportId)),
  );

const seedQueuedExport = async (userId: string) => {
  const dataExportId = v7();
  await mockDb.insert(dataExportsInUser).values({ id: dataExportId, status: DataExportStatus.Queued, userId });
  return dataExportId;
};

describe(exportUserDataHandler, () => {
  const filename = "filename";
  const name = "name";

  beforeAll(async () => {
    mockDb = (await createMockDb()).db;
    await openMockBuckets([
      StorageBucket.ClickerAssets,
      StorageBucket.GenshinAssets,
      StorageBucket.MessageAssets,
      StorageBucket.PublicUserAssets,
      StorageBucket.ResourceAssets,
      StorageBucket.UserAssets,
    ]);
  });

  afterEach(async () => {
    vi.restoreAllMocks();
    await clearMockBuckets();
    clearRoomObjectCalls();
    MockPublishedTopics.length = 0;
    await mockDb.delete(usersInAuth);
  });

  afterAll(async () => {
    await disposeMockBuckets();
  });

  test("marks an export with a failing entry failed, with its reason, and never sets a ready or expiry time", async () => {
    expect.hasAssertions();

    const userId = v7();
    await mockDb.insert(usersInAuth).values(createUser(userId));
    const room = takeOne(await mockDb.insert(roomsInMessage).values({ name, userId }).returning());
    await mockDb.insert(usersToRoomsInMessage).values({ roomId: room.id, userId });
    // The room answers with one message that attaches a file whose blob was never written, so reading it fails
    const message: RoomMessage = {
      appUserId: null,
      appUserImage: "",
      createdAt: new Date(0),
      deletedAt: null,
      editedAt: null,
      files: [{ filename, hasThumbnail: false, id: v7(), isSpoiler: false, mimetype: "mimetype", size: 0 }],
      id: 1,
      isForward: false,
      isPinned: false,
      linkPreviewResponse: null,
      mentions: [],
      message: "message",
      replyToId: null,
      senderName: null,
      type: MessageType.Message,
      updatedAt: new Date(0),
      userId,
    };
    roomObjectReplies.set("exportUserReactions", () => []);
    roomObjectReplies.set("exportUserMessages", () => [message]);
    const dataExportId = await seedQueuedExport(userId);

    await exportUserDataHandler({ dataExportId });

    await expect(readExportRow(dataExportId)).resolves.toStrictEqual({
      blobName: getDataExportBlobName(dataExportId),
      expiresAt: null,
      failureReason: expect.stringContaining("is not in the bucket to stream into the archive"),
      readyAt: null,
      status: DataExportStatus.Failed,
    });
  });

  test("marks an export ready, with its expiry the retention after it became ready", async () => {
    expect.hasAssertions();

    const userId = v7();
    await mockDb.insert(usersInAuth).values(createUser(userId));
    const dataExportId = await seedQueuedExport(userId);

    await exportUserDataHandler({ dataExportId });

    const row = await readExportRow(dataExportId);
    expect(row.status).toBe(DataExportStatus.Ready);
    assert.exists(row.readyAt);
    // Seven days, stated in milliseconds here rather than through the retention constant, so the test holds the number
    expect(row.expiresAt).toStrictEqual(
      new Date(row.readyAt.getTime() + Temporal.Duration.from({ days: 7 }).total("milliseconds")),
    );
    expect(MockPublishedTopics).toStrictEqual([getTopic(TopicKind.User, userId)]);
  });

  test("a replayed event rebuilds the same blob, leaving one archive for the export", async () => {
    expect.hasAssertions();

    const userId = v7();
    await mockDb.insert(usersInAuth).values(createUser(userId));
    const dataExportId = await seedQueuedExport(userId);

    await exportUserDataHandler({ dataExportId });
    await exportUserDataHandler({ dataExportId });

    await expect(readBlobNames(StorageBucket.UserAssets)).resolves.toStrictEqual([getDataExportBlobName(dataExportId)]);
    expect((await readExportRow(dataExportId)).status).toBe(DataExportStatus.Ready);
  });

  // A save keeps a reference to an asset that was never uploaded as the owner's data, so the export carries on past it
  test("marks an export ready when a resource references an asset that was never uploaded", async () => {
    expect.hasAssertions();

    const userId = v7();
    await mockDb.insert(usersInAuth).values(createUser(userId));
    const resource = takeOne(
      await mockDb.insert(resourcesInResource).values({ name, type: ResourceType.Note, userId }).returning(),
    );
    await mockDb.insert(resourceWorkingAssetsInResource).values({ assetHash: "0".repeat(64), resourceId: resource.id });
    const dataExportId = await seedQueuedExport(userId);

    await exportUserDataHandler({ dataExportId });

    expect((await readExportRow(dataExportId)).status).toBe(DataExportStatus.Ready);
  });

  // The account's deletion swept while the archive was still being written, before there was an object to remove
  test("removes an archive that commits after its export row was deleted", async () => {
    expect.hasAssertions();

    const userId = v7();
    await mockDb.insert(usersInAuth).values(createUser(userId));
    const room = takeOne(await mockDb.insert(roomsInMessage).values({ name, userId }).returning());
    await mockDb.insert(usersToRoomsInMessage).values({ roomId: room.id, userId });
    const dataExportId = await seedQueuedExport(userId);
    roomObjectReplies.set("exportUserMessages", () => []);
    roomObjectReplies.set("exportUserReactions", async () => {
      await mockDb.delete(dataExportsInUser).where(eq(dataExportsInUser.id, dataExportId));
      return [];
    });

    await exportUserDataHandler({ dataExportId });

    await expect(readBlobNames(StorageBucket.UserAssets)).resolves.toStrictEqual([]);
  });
});
