import type { ContainerClient } from "@azure/storage-blob";

import { FILES_DIRECTORY_SEGMENT, PUBLISHED_DIRECTORY_SEGMENT } from "#shared/services/resource/constants";
import { getResourceAssetUrl } from "#shared/services/resource/getResourceAssetUrl";
import { cloneContentAssets } from "@@/server/services/resource/cloneContentAssets";
import { ID_SEPARATOR } from "@esposter/shared";
import { MockContainerClient, MockContainerDatabase } from "azure-mock";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

const { containerClientMock } = vi.hoisted(() => ({ containerClientMock: { current: undefined } }));

vi.mock(import("@@/server/composables/azure/container/useContainerClient"), () => ({
  useContainerClient: () => Promise.resolve(containerClientMock.current),
}));

describe(cloneContentAssets, () => {
  const sourceResourceId = crypto.randomUUID();
  const destinationResourceId = crypto.randomUUID();
  const fileId = crypto.randomUUID();
  const filename = "logo.png";
  // Duplicate passes the new resource id; publish passes that id's publish directory.
  const destinationDirectoryName = destinationResourceId;
  const filesRelativeName = `${FILES_DIRECTORY_SEGMENT}/${fileId}${ID_SEPARATOR}${filename}`;
  const workingBlobName = `${sourceResourceId}/${filesRelativeName}`;
  const publishedBlobName = `${sourceResourceId}/${PUBLISHED_DIRECTORY_SEGMENT}/1/${filesRelativeName}`;
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

  // Every clone is flattened into the copy's own files directory, so a working copy and a published snapshot
  // Of one file arrive at the same destination name. Both must still survive as distinct blobs: naming the
  // Destination twice races two copies at one blob, which Azure fails and which unwinds the whole duplicate.
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

    // Never under the copy's own published prefix — unpublishing wipes that directory.
    expect(await getClonedBlobNames()).toStrictEqual([`${destinationDirectoryName}/${filesRelativeName}`]);
  });
});
