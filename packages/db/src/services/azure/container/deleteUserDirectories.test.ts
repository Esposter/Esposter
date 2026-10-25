import type { ContainerClient } from "@azure/storage-blob";

import { deleteUserDirectories } from "#src/services/azure/container/deleteUserDirectories";
import { listBlobNames } from "#src/services/azure/container/listBlobNames";
import { AzureContainer } from "@esposter/db-schema";
import { MockContainerClient, MockContainerDatabase } from "azure-mock";
import { afterEach, describe, expect, test } from "vitest";

describe(deleteUserDirectories, () => {
  const createContainerClient = (containerName: AzureContainer) =>
    new MockContainerClient("", containerName) as unknown as ContainerClient;
  const uploadBlobs = (containerClient: ContainerClient, blobNames: string[]) =>
    Promise.all(blobNames.map((blobName) => containerClient.getBlockBlobClient(blobName).upload(blobName, 1)));

  afterEach(() => {
    MockContainerDatabase.clear();
  });

  test("removes the user's prefix in the given containers and their staged packs, and no other user's blobs", async () => {
    expect.hasAssertions();

    const userId = crypto.randomUUID();
    const otherUserId = crypto.randomUUID();
    const sha256 = crypto.randomUUID();
    const publicUserAssetsClient = createContainerClient(AzureContainer.PublicUserAssets);
    const privateUserAssetsClient = createContainerClient(AzureContainer.PrivateUserAssets);
    const genshinAssetsClient = createContainerClient(AzureContainer.GenshinAssets);
    await uploadBlobs(publicUserAssetsClient, [
      `${userId}/ProfileImage`,
      `${userId}/ProfileImage.thumb`,
      `${otherUserId}/ProfileImage`,
    ]);
    await uploadBlobs(privateUserAssetsClient, [`${userId}/CallBackground/0`]);
    // The shared character-pack files are keyed by hash across accounts, so the sweep never reaches them
    await uploadBlobs(genshinAssetsClient, [
      `character-packs/staging/${userId}/keep/${sha256}`,
      `character-packs/staging/${otherUserId}/keep/${sha256}`,
      `character-packs/files/${sha256}`,
    ]);

    await deleteUserDirectories([publicUserAssetsClient, privateUserAssetsClient], genshinAssetsClient, userId);

    await expect(listBlobNames(publicUserAssetsClient, "")).resolves.toStrictEqual([`${otherUserId}/ProfileImage`]);
    await expect(listBlobNames(privateUserAssetsClient, "")).resolves.toStrictEqual([]);
    const genshinAssetsBlobNames = await listBlobNames(genshinAssetsClient, "");

    expect(genshinAssetsBlobNames.toSorted()).toStrictEqual([
      `character-packs/files/${sha256}`,
      `character-packs/staging/${otherUserId}/keep/${sha256}`,
    ]);
  });

  // The sweep is a teardown that must converge when it re-runs after an interrupted attempt, so a prefix an earlier
  // Attempt already cleared is the state being asked for, not an error
  test("finds nothing on a second call and succeeds", async () => {
    expect.hasAssertions();

    const userId = crypto.randomUUID();
    const containerClient = createContainerClient(AzureContainer.PublicUserAssets);
    const gameAssetContainerClient = createContainerClient(AzureContainer.GenshinAssets);
    await uploadBlobs(containerClient, [`${userId}/ProfileImage`, `${userId}/ProfileImage.thumb`]);
    await uploadBlobs(gameAssetContainerClient, [`character-packs/staging/${userId}/keep/${userId}`]);
    await deleteUserDirectories([containerClient], gameAssetContainerClient, userId);

    await expect(deleteUserDirectories([containerClient], gameAssetContainerClient, userId)).resolves.toBeUndefined();
    await expect(listBlobNames(containerClient, "")).resolves.toStrictEqual([]);
    await expect(listBlobNames(gameAssetContainerClient, "")).resolves.toStrictEqual([]);
  });
});
