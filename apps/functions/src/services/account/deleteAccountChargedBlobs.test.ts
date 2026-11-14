import type { Database } from "@esposter/db-schema";

import { deleteAccountChargedBlobs } from "#src/services/account/deleteAccountChargedBlobs";
import { readBlobNames } from "#src/services/azure/readBlobNames.test";
import { seedBlob } from "#src/services/azure/seedBlob.test";
import { createUser } from "#src/services/shared/createUser.test";
import { clearMockBuckets, disposeMockBuckets, openMockBuckets } from "#src/services/storage/getBucket.test";
import { createMockDb } from "@esposter/db-mock";
import { StorageBucket, storageLedgerInStorage, usersInAuth } from "@esposter/db-schema";
import { MockTableDatabase } from "azure-mock";
import { eq } from "drizzle-orm";
import { afterAll, afterEach, beforeAll, describe, expect, test, vi } from "vitest";

let mockDb: Database;

vi.mock(import("#src/services/shared/db"), () => ({
  get db() {
    return mockDb;
  },
}));
vi.mock(import("#src/services/storage/getBucket"), () => import("#src/services/storage/getBucket.test"));
vi.mock(import("#src/services/server/publishToServer"), () => import("#src/services/server/publishToServer.test"));

describe(deleteAccountChargedBlobs, () => {
  const countedBytes = 1;

  beforeAll(async () => {
    mockDb = await createMockDb();
    await openMockBuckets([StorageBucket.MessageAssets, StorageBucket.UserAssets]);
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

  const seedChargedBlob = async (userId: string, containerName: StorageBucket, blobName: string) => {
    await seedBlob(containerName, blobName);
    await mockDb
      .insert(storageLedgerInStorage)
      .values({ blobName, containerName, countedBytes, declaredBytes: countedBytes, expiresAt: new Date(0), userId });
  };

  test("removes the blobs the account is charged for through the ledger, and no blob another account is charged for", async () => {
    expect.hasAssertions();

    const userId = crypto.randomUUID();
    const otherUserId = crypto.randomUUID();
    const roomId = crypto.randomUUID();
    await mockDb.insert(usersInAuth).values([createUser(userId), createUser(otherUserId)]);
    // The two charges the account holds are what its counter carries, so the release has bytes to give back
    await mockDb
      .update(usersInAuth)
      .set({ storageBytesUsed: countedBytes * 2 })
      .where(eq(usersInAuth.id, userId));
    const chargedMessageBlobName = `${roomId}/${crypto.randomUUID()}`;
    const chargedBackgroundBlobName = `${userId}/CallBackground/0`;
    const otherMessageBlobName = `${roomId}/${crypto.randomUUID()}`;
    await seedChargedBlob(userId, StorageBucket.MessageAssets, chargedMessageBlobName);
    await seedChargedBlob(userId, StorageBucket.UserAssets, chargedBackgroundBlobName);
    await seedChargedBlob(otherUserId, StorageBucket.MessageAssets, otherMessageBlobName);

    await deleteAccountChargedBlobs(userId);

    await expect(readBlobNames(StorageBucket.MessageAssets)).resolves.toStrictEqual([otherMessageBlobName]);
    await expect(readBlobNames(StorageBucket.UserAssets)).resolves.toStrictEqual([]);
    await expect(
      mockDb
        .select({ blobName: storageLedgerInStorage.blobName, userId: storageLedgerInStorage.userId })
        .from(storageLedgerInStorage),
    ).resolves.toStrictEqual([{ blobName: otherMessageBlobName, userId: otherUserId }]);
  });
});
