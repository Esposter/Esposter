import type { BatchSubResponse, ContainerClient } from "@azure/storage-blob";

import { deleteBlobs } from "#src/services/azure/container/deleteBlobs";
import { takeOne } from "@esposter/shared";
import { describe, expect, test, vi } from "vitest";

describe(deleteBlobs, () => {
  const containerUrl = "";
  const prefix = crypto.randomUUID();

  // The batch answers one status per blob in the order they were named, which is the one thing a test varies
  const setupContainerClient = (statuses: number[]) => {
    const deleteBlobsBatch = vi.fn<
      (blobUrls: string[]) => Promise<{ subResponses: Pick<BatchSubResponse, "status">[] }>
    >((blobUrls) =>
      Promise.resolve({ subResponses: blobUrls.map((_blobUrl, index) => ({ status: takeOne(statuses, index) })) }),
    );
    const containerClient = {
      credential: {},
      getBlobBatchClient: () => ({ deleteBlobs: deleteBlobsBatch }),
      getBlockBlobClient: (blobName: string) => ({ url: `${containerUrl}/${prefix}/${blobName}` }),
      url: containerUrl,
    };
    return containerClient as unknown as ContainerClient;
  };

  // A blob an earlier attempt already removed is the state a teardown asks for, so it is not a failure
  test("counts a blob already gone as deleted", async () => {
    expect.hasAssertions();

    await expect(deleteBlobs(setupContainerClient([404]), ["a"])).resolves.toStrictEqual([]);
  });

  // A conditional delete is refused for a blob written after the listing, and that blob must survive the sweep
  test("reports the blob a condition refused as kept", async () => {
    expect.hasAssertions();

    await expect(
      deleteBlobs(setupContainerClient([202, 412]), ["a", "b"], { ifUnmodifiedSince: new Date(0) }),
    ).resolves.toStrictEqual(["b"]);
  });

  // Without a condition a 412 cannot come from the caller's own request, so it is a failure rather than a kept blob
  test("throws on a 412 when no condition was asked for", async () => {
    expect.hasAssertions();

    await expect(deleteBlobs(setupContainerClient([412]), ["a"])).rejects.toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Delete, name: deleteBlobs, 412]`,
    );
  });
});
