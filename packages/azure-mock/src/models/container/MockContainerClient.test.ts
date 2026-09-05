import { MOCK_BLOB_BASE_URL } from "#src/constants";
import { MockContainerClient } from "#src/models/container/MockContainerClient";
import { MockContainerDatabase } from "#src/store/MockContainerDatabase";
import { afterEach, describe, expect, test } from "vitest";

describe(MockContainerClient, () => {
  const containerName = "containerName";

  afterEach(() => {
    MockContainerDatabase.clear();
  });

  // The virtual directories are the whole reason a caller passes a delimiter, so the page has to carry them
  // Alongside the blobs at the current level — a flat segment reports the blobs and silently drops the rest
  test("keeps both the blobs and the virtual directories in a hierarchy page", async () => {
    expect.hasAssertions();

    MockContainerDatabase.set(
      containerName,
      new Map([
        ["a/a", Buffer.from("")],
        ["a", Buffer.from("")],
      ]),
    );
    const client = new MockContainerClient(MOCK_BLOB_BASE_URL, containerName);
    const [page] = await Array.fromAsync(client.listBlobsByHierarchy("/").byPage());

    expect(page?.segment.blobItems.map(({ name }) => name)).toStrictEqual(["a"]);
    expect(page?.segment.blobPrefixes?.map(({ name }) => name)).toStrictEqual(["a/"]);
  });

  test("clears a deleted blob's metadata", async () => {
    expect.hasAssertions();

    const blobName = "blobName";
    const client = new MockContainerClient(MOCK_BLOB_BASE_URL, containerName);
    const blockBlobClient = client.getBlockBlobClient(blobName);
    await blockBlobClient.upload("", 0, { metadata: { reason: "reason" } });
    const [uploadedBlob] = await Array.fromAsync(client.listBlobsFlat({ includeMetadata: true }));

    expect(uploadedBlob?.metadata).toStrictEqual({ reason: "reason" });

    await client.deleteBlob(blobName);
    MockContainerDatabase.get(containerName)?.set(blobName, Buffer.from(""));
    const [blob] = await Array.fromAsync(client.listBlobsFlat({ includeMetadata: true }));

    // The re-seeded blob is what the listing must return: without this, an empty listing would pass the
    // Assertion below on a blob that is not there
    expect(blob?.name).toBe(blobName);
    expect(blob?.metadata).toBeUndefined();
  });
});
