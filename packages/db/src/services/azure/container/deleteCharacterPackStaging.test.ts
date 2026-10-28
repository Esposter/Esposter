import { createContainerClient } from "#src/services/azure/container/createContainerClient.test";
import { deleteCharacterPackStaging } from "#src/services/azure/container/deleteCharacterPackStaging";
import { getCharacterPackStagingPrefix } from "#src/services/azure/container/getCharacterPackStagingPrefix";
import { listBlobNames } from "#src/services/azure/container/listBlobNames";
import { uploadBlobs } from "#src/services/azure/container/uploadBlobs.test";
import { AzureContainer, getSaveBlobName } from "@esposter/db-schema";
import { MockContainerDatabase } from "azure-mock";
import { afterEach, describe, expect, test } from "vitest";

describe(deleteCharacterPackStaging, () => {
  afterEach(() => {
    MockContainerDatabase.clear();
  });

  test("removes the user's staged packs and no other user's staging, nor the shared character-pack files", async () => {
    expect.hasAssertions();

    const userId = crypto.randomUUID();
    const otherUserId = crypto.randomUUID();
    const sha256 = crypto.randomUUID();
    const genshinAssetsClient = createContainerClient(AzureContainer.GenshinAssets);
    // The shared character-pack files are keyed by hash across accounts, so the staging sweep never reaches them
    await uploadBlobs(genshinAssetsClient, [
      getSaveBlobName(userId),
      `${getCharacterPackStagingPrefix(userId)}keep/${sha256}`,
      `${getCharacterPackStagingPrefix(otherUserId)}keep/${sha256}`,
      `character-packs/files/${sha256}`,
    ]);

    await deleteCharacterPackStaging(genshinAssetsClient, userId);

    // The user's own prefix sorts before or after the pack folders depending on the id's first character, so both sides sort
    expect((await listBlobNames(genshinAssetsClient, "")).toSorted()).toStrictEqual(
      [
        getSaveBlobName(userId),
        `character-packs/files/${sha256}`,
        `${getCharacterPackStagingPrefix(otherUserId)}keep/${sha256}`,
      ].toSorted(),
    );
  });

  // The sweep is a teardown that must converge when it re-runs after an interrupted attempt, so a prefix an earlier
  // Attempt already cleared is the state being asked for, not an error
  test("finds nothing on a second call and succeeds", async () => {
    expect.hasAssertions();

    const userId = crypto.randomUUID();
    const genshinAssetsClient = createContainerClient(AzureContainer.GenshinAssets);
    await uploadBlobs(genshinAssetsClient, [`${getCharacterPackStagingPrefix(userId)}keep/${userId}`]);
    await deleteCharacterPackStaging(genshinAssetsClient, userId);

    await expect(deleteCharacterPackStaging(genshinAssetsClient, userId)).resolves.toBeUndefined();
    await expect(listBlobNames(genshinAssetsClient, "")).resolves.toStrictEqual([]);
  });
});
