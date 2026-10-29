import { deleteAccountBlobDirectories } from "#src/services/account/deleteAccountBlobDirectories";
import { readBlobNames } from "#src/services/azure/readBlobNames.test";
import { seedBlob } from "#src/services/azure/seedBlob.test";
import { AzureContainer, getSaveBlobName, getUserProfileImageBlobName } from "@esposter/db-schema";
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
    await seedBlob(AzureContainer.PublicUserAssets, getUserProfileImageBlobName(userId));
    await seedBlob(AzureContainer.PublicUserAssets, getUserProfileImageBlobName(otherUserId));
    await seedBlob(AzureContainer.UserAssets, `${userId}/CallBackground/0`);
    await seedBlob(AzureContainer.GenshinAssets, getSaveBlobName(userId));
    await seedBlob(AzureContainer.ClickerAssets, getSaveBlobName(userId));
    await seedBlob(AzureContainer.UserAssets, getSaveBlobName(userId));

    await deleteAccountBlobDirectories(userId);

    expect(readBlobNames(AzureContainer.PublicUserAssets)).toStrictEqual([getUserProfileImageBlobName(otherUserId)]);
    expect(readBlobNames(AzureContainer.UserAssets)).toStrictEqual([]);
    expect(readBlobNames(AzureContainer.GenshinAssets)).toStrictEqual([]);
    expect(readBlobNames(AzureContainer.ClickerAssets)).toStrictEqual([]);
  });
});
