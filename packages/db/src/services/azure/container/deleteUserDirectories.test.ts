import { createContainerClient } from "#src/services/azure/container/createContainerClient.test";
import { deleteUserDirectories } from "#src/services/azure/container/deleteUserDirectories";
import { listBlobNames } from "#src/services/azure/container/listBlobNames";
import { uploadBlobs } from "#src/services/azure/container/uploadBlobs.test";
import { AzureContainer } from "@esposter/db-schema";
import { MockContainerDatabase } from "azure-mock";
import { afterEach, describe, expect, test } from "vitest";

describe(deleteUserDirectories, () => {
  afterEach(() => {
    MockContainerDatabase.clear();
  });

  test("removes the user's prefix in the given containers and no other user's blobs", async () => {
    expect.hasAssertions();

    const userId = crypto.randomUUID();
    const otherUserId = crypto.randomUUID();
    const sha256 = crypto.randomUUID();
    const publicUserAssetsClient = createContainerClient(AzureContainer.PublicUserAssets);
    const userAssetsClient = createContainerClient(AzureContainer.UserAssets);
    const genshinAssetsClient = createContainerClient(AzureContainer.GenshinAssets);
    await uploadBlobs(publicUserAssetsClient, [
      `${userId}/ProfileImage`,
      `${userId}/ProfileImage.thumb`,
      `${otherUserId}/ProfileImage`,
    ]);
    await uploadBlobs(userAssetsClient, [`${userId}/CallBackground/0`]);
    // The shared character-pack files are keyed by hash across accounts, so the sweep never reaches them, and a staged
    // Pack sits outside the user's prefix, so it is left for its own sweep
    await uploadBlobs(genshinAssetsClient, [
      `${userId}/save.json`,
      `character-packs/staging/${userId}/keep/${sha256}`,
      `character-packs/files/${sha256}`,
    ]);

    await deleteUserDirectories([publicUserAssetsClient, userAssetsClient, genshinAssetsClient], userId);

    await expect(listBlobNames(publicUserAssetsClient, "")).resolves.toStrictEqual([`${otherUserId}/ProfileImage`]);
    await expect(listBlobNames(userAssetsClient, "")).resolves.toStrictEqual([]);
    const genshinAssetsBlobNames = await listBlobNames(genshinAssetsClient, "");

    expect(genshinAssetsBlobNames.toSorted()).toStrictEqual([
      `character-packs/files/${sha256}`,
      `character-packs/staging/${userId}/keep/${sha256}`,
    ]);
  });

  // The sweep is a teardown that must converge when it re-runs after an interrupted attempt, so a prefix an earlier
  // Attempt already cleared is the state being asked for, not an error
  test("finds nothing on a second call and succeeds", async () => {
    expect.hasAssertions();

    const userId = crypto.randomUUID();
    const containerClient = createContainerClient(AzureContainer.PublicUserAssets);
    await uploadBlobs(containerClient, [`${userId}/ProfileImage`, `${userId}/ProfileImage.thumb`]);
    await deleteUserDirectories([containerClient], userId);

    await expect(deleteUserDirectories([containerClient], userId)).resolves.toBeUndefined();
    await expect(listBlobNames(containerClient, "")).resolves.toStrictEqual([]);
  });
});
