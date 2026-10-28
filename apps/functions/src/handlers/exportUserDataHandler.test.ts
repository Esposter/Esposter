import type { Database } from "@esposter/db-schema";

import { exportUserDataHandler } from "#src/handlers/exportUserDataHandler";
import { getTableClient } from "#src/services/azure/getTableClient";
import { readBlobNames } from "#src/services/azure/readBlobNames.test";
import { createUser } from "#src/services/shared/createUser.test";
import { getDataExportBlobName } from "#src/services/user/getDataExportBlobName";
import { InvocationContext } from "@azure/functions";
import { createMessage } from "@esposter/db";
import { createMockDb } from "@esposter/db-mock";
import {
  AzureContainer,
  AzureTable,
  dataExportsInUser,
  DataExportStatus,
  MessageType,
  roomsInMessage,
  usersInAuth,
  usersToRoomsInMessage,
} from "@esposter/db-schema";
import { takeOne } from "@esposter/shared";
import { MockContainerDatabase, MockTableDatabase } from "azure-mock";
import { eq } from "drizzle-orm";
import { afterEach, assert, beforeAll, describe, expect, test, vi } from "vitest";

let mockDb: Database;

vi.mock(import("#src/services/shared/db"), () => ({
  get db() {
    return mockDb;
  },
}));
vi.mock(import("#src/services/azure/getContainerClient"), () => import("#src/services/azure/getContainerClient.test"));
vi.mock(import("#src/services/azure/getTableClient"), () => import("#src/services/azure/getTableClient.test"));

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
  const context = new InvocationContext({ logHandler: () => {} });
  const name = "name";

  beforeAll(async () => {
    mockDb = await createMockDb();
  });

  afterEach(async () => {
    vi.restoreAllMocks();
    MockContainerDatabase.clear();
    MockTableDatabase.clear();
    await mockDb.delete(usersInAuth);
  });

  test("marks an export with a failing entry failed, with its reason, and never sets a ready or expiry time", async () => {
    expect.hasAssertions();

    const userId = crypto.randomUUID();
    await mockDb.insert(usersInAuth).values(createUser(userId));
    const room = takeOne(await mockDb.insert(roomsInMessage).values({ name, userId }).returning());
    await mockDb.insert(usersToRoomsInMessage).values({ roomId: room.id, userId });
    // The message attaches a file whose blob was never written, so reading that entry fails
    await createMessage(await getTableClient(AzureTable.Messages), await getTableClient(AzureTable.MessagesAscending), {
      files: [
        { filename: name, hasThumbnail: false, id: crypto.randomUUID(), isSpoiler: false, mimetype: name, size: 0 },
      ],
      message: name,
      roomId: room.id,
      type: MessageType.Message,
      userId,
    });
    const dataExportId = await seedQueuedExport(userId);

    await exportUserDataHandler(context, { dataExportId });

    await expect(readExportRow(dataExportId)).resolves.toStrictEqual({
      blobName: getDataExportBlobName(dataExportId),
      expiresAt: null,
      failureReason: "The specified blob does not exist.",
      readyAt: null,
      status: DataExportStatus.Failed,
    });
  });

  test("marks an export ready, with its expiry the retention after it became ready", async () => {
    expect.hasAssertions();

    const userId = crypto.randomUUID();
    await mockDb.insert(usersInAuth).values(createUser(userId));
    const dataExportId = await seedQueuedExport(userId);

    await exportUserDataHandler(context, { dataExportId });

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

    await exportUserDataHandler(context, { dataExportId });
    await exportUserDataHandler(context, { dataExportId });

    expect(readBlobNames(AzureContainer.UserAssets)).toStrictEqual([getDataExportBlobName(dataExportId)]);
    expect((await readExportRow(dataExportId)).status).toBe(DataExportStatus.Ready);
  });
});
