import { deleteAccountBlobDirectories } from "#src/services/account/deleteAccountBlobDirectories";
import { readBlobNames } from "#src/services/azure/readBlobNames.test";
import { seedBlob } from "#src/services/azure/seedBlob.test";
import { clearMockBuckets, disposeMockBuckets, openMockBuckets } from "#src/services/storage/getBucket.test";
import { StorageBucket, getSaveBlobName, getUserProfileImageBlobName } from "@esposter/db-schema";
import { v7 } from "uuid";
import { afterAll, afterEach, beforeAll, describe, expect, test, vi } from "vitest";

vi.mock(import("#src/services/storage/getBucket"), () => import("#src/services/storage/getBucket.test"));

describe(deleteAccountBlobDirectories, () => {
  beforeAll(async () => {
    await openMockBuckets([
      StorageBucket.ClickerAssets,
      StorageBucket.GenshinAssets,
      StorageBucket.PublicUserAssets,
      StorageBucket.UserAssets,
    ]);
  });

  afterEach(async () => {
    vi.restoreAllMocks();
    await clearMockBuckets();
  });

  afterAll(async () => {
    await disposeMockBuckets();
  });

  test("removes the account's blobs under its prefix and no other account's blobs", async () => {
    expect.hasAssertions();

    const userId = v7();
    const otherUserId = v7();
    await seedBlob(StorageBucket.PublicUserAssets, getUserProfileImageBlobName(userId));
    await seedBlob(StorageBucket.PublicUserAssets, getUserProfileImageBlobName(otherUserId));
    await seedBlob(StorageBucket.UserAssets, `${userId}/CallBackground/0`);
    await seedBlob(StorageBucket.GenshinAssets, getSaveBlobName(userId));
    await seedBlob(StorageBucket.ClickerAssets, getSaveBlobName(userId));
    await seedBlob(StorageBucket.UserAssets, getSaveBlobName(userId));

    await deleteAccountBlobDirectories(userId);

    await expect(readBlobNames(StorageBucket.PublicUserAssets)).resolves.toStrictEqual([
      getUserProfileImageBlobName(otherUserId),
    ]);
    await expect(readBlobNames(StorageBucket.UserAssets)).resolves.toStrictEqual([]);
    await expect(readBlobNames(StorageBucket.GenshinAssets)).resolves.toStrictEqual([]);
    await expect(readBlobNames(StorageBucket.ClickerAssets)).resolves.toStrictEqual([]);
  });
});
