import { deleteAccountBlobDirectories } from "#src/services/account/deleteAccountBlobDirectories";
import { readBlobNames } from "#src/services/azure/readBlobNames.test";
import { seedBlob } from "#src/services/azure/seedBlob.test";
import { StorageBucket, getSaveBlobName, getUserProfileImageBlobName } from "@esposter/db-schema";
import { MockContainerDatabase } from "azure-mock";
import { afterEach, describe, expect, test, vi } from "vitest";

vi.mock(import("#src/services/azure/getContainerClient"), () => import("#src/services/azure/getContainerClient.test"));

describe(deleteAccountBlobDirectories, () => {
  afterEach(() => {
    vi.restoreAllMocks();
    MockContainerDatabase.clear();
  });

  test("removes the account's blobs under its prefix and no other account's blobs", async () => {
    expect.hasAssertions();

    const userId = crypto.randomUUID();
    const otherUserId = crypto.randomUUID();
    await seedBlob(StorageBucket.PublicUserAssets, getUserProfileImageBlobName(userId));
    await seedBlob(StorageBucket.PublicUserAssets, getUserProfileImageBlobName(otherUserId));
    await seedBlob(StorageBucket.UserAssets, `${userId}/CallBackground/0`);
    await seedBlob(StorageBucket.GenshinAssets, getSaveBlobName(userId));
    await seedBlob(StorageBucket.ClickerAssets, getSaveBlobName(userId));
    await seedBlob(StorageBucket.UserAssets, getSaveBlobName(userId));

    await deleteAccountBlobDirectories(userId);

    expect(readBlobNames(StorageBucket.PublicUserAssets)).toStrictEqual([getUserProfileImageBlobName(otherUserId)]);
    expect(readBlobNames(StorageBucket.UserAssets)).toStrictEqual([]);
    expect(readBlobNames(StorageBucket.GenshinAssets)).toStrictEqual([]);
    expect(readBlobNames(StorageBucket.ClickerAssets)).toStrictEqual([]);
  });
});
