import { deleteAccountBlobDirectories } from "#src/services/account/deleteAccountBlobDirectories";
import { readBlobNames } from "#src/services/azure/readBlobNames.test";
import { seedBlob } from "#src/services/azure/seedBlob.test";
import { AzureContainer } from "@esposter/db-schema";
import { MockContainerDatabase } from "azure-mock";
import { afterEach, describe, expect, test, vi } from "vitest";

vi.mock(import("#src/services/azure/getContainerClient"), () => import("#src/services/azure/getContainerClient.test"));

describe(deleteAccountBlobDirectories, () => {
  afterEach(() => {
    vi.restoreAllMocks();
    MockContainerDatabase.clear();
  });

  test("removes the account's blobs under its prefix and its staged packs, and no other account's blobs or the shared pack files", async () => {
    expect.hasAssertions();

    const userId = crypto.randomUUID();
    const otherUserId = crypto.randomUUID();
    const sha256 = crypto.randomUUID();
    await seedBlob(AzureContainer.PublicUserAssets, `${userId}/ProfileImage`);
    await seedBlob(AzureContainer.PublicUserAssets, `${otherUserId}/ProfileImage`);
    await seedBlob(AzureContainer.UserAssets, `${userId}/CallBackground/0`);
    await seedBlob(AzureContainer.GenshinAssets, `${userId}/save.json`);
    await seedBlob(AzureContainer.GenshinAssets, `character-packs/staging/${userId}/keep/${sha256}`);
    await seedBlob(AzureContainer.GenshinAssets, `character-packs/staging/${otherUserId}/keep/${sha256}`);
    await seedBlob(AzureContainer.GenshinAssets, `character-packs/files/${sha256}`);
    await seedBlob(AzureContainer.ClickerAssets, `${userId}/save.json`);
    await seedBlob(AzureContainer.UserAssets, `${userId}/save.json`);

    await deleteAccountBlobDirectories(userId);

    expect(readBlobNames(AzureContainer.PublicUserAssets)).toStrictEqual([`${otherUserId}/ProfileImage`]);
    expect(readBlobNames(AzureContainer.UserAssets)).toStrictEqual([]);
    expect(readBlobNames(AzureContainer.GenshinAssets).toSorted()).toStrictEqual([
      `character-packs/files/${sha256}`,
      `character-packs/staging/${otherUserId}/keep/${sha256}`,
    ]);
    expect(readBlobNames(AzureContainer.ClickerAssets)).toStrictEqual([]);
  });
});
