import type { Database } from "@esposter/db-schema";

import { deleteAccountDataExportArchives } from "#src/services/account/deleteAccountDataExportArchives";
import { readBlobNames } from "#src/services/azure/readBlobNames.test";
import { seedBlob } from "#src/services/azure/seedBlob.test";
import { createUser } from "#src/services/shared/createUser.test";
import { getDataExportBlobName } from "#src/services/user/getDataExportBlobName";
import { createMockDb } from "@esposter/db-mock";
import { AzureContainer, dataExportsInUser, DataExportStatus, usersInAuth } from "@esposter/db-schema";
import { MockContainerDatabase } from "azure-mock";
import { afterEach, beforeAll, describe, expect, test, vi } from "vitest";

let mockDb: Database;

vi.mock(import("#src/services/shared/db"), () => ({
  get db() {
    return mockDb;
  },
}));
vi.mock(import("#src/services/azure/getContainerClient"), () => import("#src/services/azure/getContainerClient.test"));

describe(deleteAccountDataExportArchives, () => {
  beforeAll(async () => {
    mockDb = await createMockDb();
  });

  afterEach(async () => {
    vi.restoreAllMocks();
    MockContainerDatabase.clear();
    await mockDb.delete(usersInAuth);
  });

  test("deletes the archive each of the person's export rows names, and no other person's archive", async () => {
    expect.hasAssertions();

    const userId = crypto.randomUUID();
    const otherUserId = crypto.randomUUID();
    const dataExportId = crypto.randomUUID();
    const secondDataExportId = crypto.randomUUID();
    const otherDataExportId = crypto.randomUUID();
    await mockDb.insert(usersInAuth).values([createUser(userId), createUser(otherUserId)]);
    await mockDb.insert(dataExportsInUser).values([
      { blobName: getDataExportBlobName(dataExportId), id: dataExportId, status: DataExportStatus.Ready, userId },
      {
        blobName: getDataExportBlobName(secondDataExportId),
        id: secondDataExportId,
        status: DataExportStatus.Ready,
        userId,
      },
      // A queued export has no archive yet, so its row names no blob
      { id: crypto.randomUUID(), status: DataExportStatus.Queued, userId },
      {
        blobName: getDataExportBlobName(otherDataExportId),
        id: otherDataExportId,
        status: DataExportStatus.Ready,
        userId: otherUserId,
      },
    ]);
    await seedBlob(AzureContainer.UserAssets, getDataExportBlobName(dataExportId));
    await seedBlob(AzureContainer.UserAssets, getDataExportBlobName(secondDataExportId));
    await seedBlob(AzureContainer.UserAssets, getDataExportBlobName(otherDataExportId));

    await deleteAccountDataExportArchives(userId);

    expect(readBlobNames(AzureContainer.UserAssets)).toStrictEqual([getDataExportBlobName(otherDataExportId)]);
  });

  test("a row whose archive is already gone does not fail the sweep, and the archive it still holds is removed", async () => {
    expect.hasAssertions();

    const userId = crypto.randomUUID();
    const goneDataExportId = crypto.randomUUID();
    const dataExportId = crypto.randomUUID();
    await mockDb.insert(usersInAuth).values(createUser(userId));
    await mockDb.insert(dataExportsInUser).values([
      {
        blobName: getDataExportBlobName(goneDataExportId),
        id: goneDataExportId,
        status: DataExportStatus.Ready,
        userId,
      },
      { blobName: getDataExportBlobName(dataExportId), id: dataExportId, status: DataExportStatus.Ready, userId },
    ]);
    await seedBlob(AzureContainer.UserAssets, getDataExportBlobName(dataExportId));

    await deleteAccountDataExportArchives(userId);

    expect(readBlobNames(AzureContainer.UserAssets)).toStrictEqual([]);
  });
});
