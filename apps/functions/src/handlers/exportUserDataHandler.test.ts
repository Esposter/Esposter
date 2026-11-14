import type { Database } from "@esposter/db-schema";

import { exportUserDataHandler } from "#src/handlers/exportUserDataHandler";
import { readBlobNames } from "#src/services/azure/readBlobNames.test";
import { createUser } from "#src/services/shared/createUser.test";
import { clearMockBuckets, disposeMockBuckets, openMockBuckets } from "#src/services/storage/getBucket.test";
import { getStreamTableClient } from "#src/services/streams/getStreamTableClient";
import { getDataExportBlobName } from "#src/services/user/getDataExportBlobName";
import { createMessage } from "@esposter/db";
import { createMockDb } from "@esposter/db-mock";
import {
  StorageBucket,
  StreamTable,
  dataExportsInUser,
  DataExportStatus,
  MessageType,
  roomsInMessage,
  usersInAuth,
  usersToRoomsInMessage,
} from "@esposter/db-schema";
import { takeOne } from "@esposter/shared";
import { MockTableDatabase } from "azure-mock";
import { eq } from "drizzle-orm";
import { afterAll, afterEach, assert, beforeAll, describe, expect, test, vi } from "vitest";

let mockDb: Database;

vi.mock(import("#src/services/shared/db"), () => ({
  get db() {
    return mockDb;
  },
}));
vi.mock(import("#src/services/storage/getBucket"), () => import("#src/services/storage/getBucket.test"));
vi.mock(
  import("#src/services/streams/getStreamTableClient"),
  () => import("#src/services/streams/getStreamTableClient.test"),
);

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
  const dataExportId = crypto.randomUUID();
  await mockDb.insert(dataExportsInUser).values({ id: dataExportId, status: DataExportStatus.Queued, userId });
  return dataExportId;
};

describe(exportUserDataHandler, () => {
  const filename = "filename";
  const name = "name";

  beforeAll(async () => {
    mockDb = await createMockDb();
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
    MockTableDatabase.clear();
    await mockDb.delete(usersInAuth);
  });

  afterAll(async () => {
    await disposeMockBuckets();
  });

  test("marks an export with a failing entry failed, with its reason, and never sets a ready or expiry time", async () => {
    expect.hasAssertions();

    const userId = crypto.randomUUID();
    await mockDb.insert(usersInAuth).values(createUser(userId));
    const room = takeOne(await mockDb.insert(roomsInMessage).values({ name, userId }).returning());
    await mockDb.insert(usersToRoomsInMessage).values({ roomId: room.id, userId });
    // The message attaches a file whose blob was never written, so reading that entry fails
    await createMessage(getStreamTableClient(StreamTable.Messages), {
      files: [
        { filename, hasThumbnail: false, id: crypto.randomUUID(), isSpoiler: false, mimetype: "mimetype", size: 0 },
      ],
      message: "message",
      roomId: room.id,
      type: MessageType.Message,
      userId,
    });
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

    const userId = crypto.randomUUID();
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
  });

  test("a replayed event rebuilds the same blob, leaving one archive for the export", async () => {
    expect.hasAssertions();

    const userId = crypto.randomUUID();
    await mockDb.insert(usersInAuth).values(createUser(userId));
    const dataExportId = await seedQueuedExport(userId);

    await exportUserDataHandler({ dataExportId });
    await exportUserDataHandler({ dataExportId });

    await expect(readBlobNames(StorageBucket.UserAssets)).resolves.toStrictEqual([getDataExportBlobName(dataExportId)]);
    expect((await readExportRow(dataExportId)).status).toBe(DataExportStatus.Ready);
  });
});
