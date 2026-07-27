import type { ContainerClient } from "@azure/storage-blob";

import { FILES_DIRECTORY_SEGMENT, PUBLISHED_DIRECTORY_SEGMENT } from "#shared/services/resource/constants";
import { getResourceAssetUrl } from "#shared/services/resource/getResourceAssetUrl";
import { cloneContentAssets } from "@@/server/services/resource/cloneContentAssets";
import { ID_SEPARATOR, takeOne } from "@esposter/shared";
import { MockContainerClient, MockContainerDatabase } from "azure-mock";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

const { containerClientMock } = vi.hoisted(() => ({
  containerClientMock: {} as { current: ContainerClient },
}));

vi.mock(import("@@/server/composables/azure/container/useContainerClient"), () => ({
  useContainerClient: () => Promise.resolve(containerClientMock.current),
}));

describe(cloneContentAssets, () => {
  const sourceResourceId = crypto.randomUUID();
  const destinationResourceId = crypto.randomUUID();
  const fileId = crypto.randomUUID();
  const filename = "a";
  // Duplicate passes the new resource id; publish passes that id's publish directory.
  const destinationDirectoryName = destinationResourceId;
  const filesRelativeName = `${FILES_DIRECTORY_SEGMENT}/${fileId}${ID_SEPARATOR}${filename}`;
  const workingBlobName = `${sourceResourceId}/${filesRelativeName}`;
  const publishedBlobName = `${sourceResourceId}/${PUBLISHED_DIRECTORY_SEGMENT}/${crypto.randomUUID()}/${filesRelativeName}`;
  let containerClient: MockContainerClient;

  beforeEach(async () => {
    containerClient = new MockContainerClient("", "resource-assets");
    containerClientMock.current = containerClient as unknown as ContainerClient;
    for (const blobName of [workingBlobName, publishedBlobName])
      await containerClient.getBlockBlobClient(blobName).upload(blobName, blobName.length);
  });

  afterEach(() => {
    MockContainerDatabase.clear();
    vi.restoreAllMocks();
  });

  const getClonedBlobNames = async () => {
    const blobNames: string[] = [];
    for await (const { name } of containerClient.listBlobsFlat({ prefix: destinationResourceId })) blobNames.push(name);
    return blobNames;
  };

  // Every clone is flattened into the copy's own files directory, so a working copy and a published snapshot of
  // One file would arrive at the same destination name were the source id carried over. Both must survive as
  // Distinct blobs — naming one destination twice races two copies at it, which Azure fails, unwinding the clone.
  test("clones both a working and a published reference to the same file", async () => {
    expect.hasAssertions();

    const content = {
      html: `<img src="${getResourceAssetUrl(workingBlobName)}"><img src="${getResourceAssetUrl(publishedBlobName)}">`,
    };
    const clonedContent = await cloneContentAssets(content, destinationDirectoryName, true);
    const clonedBlobNames = await getClonedBlobNames();

    expect(clonedBlobNames).toHaveLength(2);
    // Each source url is rewritten to its own clone, so neither reference is left pointing at the original.
    for (const clonedBlobName of clonedBlobNames)
      expect(clonedContent.html).toContain(getResourceAssetUrl(clonedBlobName));
    expect(clonedContent.html).not.toContain(getResourceAssetUrl(workingBlobName));
  });

  test("clones a published reference into the copy's working files directory", async () => {
    expect.hasAssertions();

    const content = { html: `<img src="${getResourceAssetUrl(publishedBlobName)}">` };
    await cloneContentAssets(content, destinationDirectoryName, true);
    const clonedBlobNames = await getClonedBlobNames();

    // Never under the copy's own published prefix — unpublishing wipes that directory.
    expect(clonedBlobNames).toHaveLength(1);
    expect(takeOne(clonedBlobNames)).toMatch(
      new RegExp(
        `^${destinationDirectoryName}/${FILES_DIRECTORY_SEGMENT}/[\\da-f-]+\\${ID_SEPARATOR}${filename}$`,
        "u",
      ),
    );
  });

  // Restore clones a snapshot back into the resource's OWN files directory. Reusing the source's id there
  // Rebuilds the exact name a `deleteFile` of that asset already published for deletion — and a named-blob
  // Deletion event carries no time bound, so its redelivery or dead-letter replay destroys the restored blob.
  test("never rebuilds the source name when cloning into the same resource", async () => {
    expect.hasAssertions();

    const content = { html: `<img src="${getResourceAssetUrl(publishedBlobName)}">` };
    const clonedContent = await cloneContentAssets(content, sourceResourceId, true);
    const clonedBlobNames: string[] = [];
    for await (const { name } of containerClient.listBlobsFlat({
      prefix: `${sourceResourceId}/${FILES_DIRECTORY_SEGMENT}/`,
    }))
      clonedBlobNames.push(name);

    expect(clonedBlobNames).toContain(workingBlobName);
    expect(clonedBlobNames).toHaveLength(2);
    expect(clonedContent.html).not.toContain(getResourceAssetUrl(workingBlobName));
  });
});
