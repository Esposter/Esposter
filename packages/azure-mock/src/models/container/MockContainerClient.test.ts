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
        ["nested/child.txt", Buffer.from("")],
        ["root.txt", Buffer.from("")],
      ]),
    );
    const client = new MockContainerClient(MOCK_BLOB_BASE_URL, containerName);
    const [page] = await Array.fromAsync(client.listBlobsByHierarchy("/").byPage());

    expect(page?.segment.blobItems.map(({ name }) => name)).toStrictEqual(["root.txt"]);
    expect(page?.segment.blobPrefixes?.map(({ name }) => name)).toStrictEqual(["nested/"]);
  });
});
