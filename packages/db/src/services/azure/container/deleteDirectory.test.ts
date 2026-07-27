import type { BatchSubResponse, ContainerClient } from "@azure/storage-blob";

import { deleteDirectory } from "@/services/azure/container/deleteDirectory";
import { MAX_BLOB_BATCH_DELETIONS } from "@esposter/db-schema";
import { takeOne } from "@esposter/shared";
import { describe, expect, test, vi } from "vitest";

describe(deleteDirectory, () => {
  const containerUrl = "https://account.blob.core.windows.net/resource-assets";
  const prefix = crypto.randomUUID();

  // The batch resolves whatever its blobs did, so a status per url is what a test varies
  const setupContainerClient = (blobNames: string[], status = 202) => {
    const deleteBlobs = vi.fn<(blobUrls: string[]) => Promise<{ subResponses: Pick<BatchSubResponse, "status">[] }>>(
      (blobUrls) => Promise.resolve({ subResponses: blobUrls.map(() => ({ status })) }),
    );
    const containerClient = {
      credential: {},
      getBlobBatchClient: () => ({ deleteBlobs }),
      getBlockBlobClient: (blobName: string) => ({
        url: `${containerUrl}/${blobName
          .split("/")
          .map((segment) => encodeURIComponent(segment))
          .join("/")}`,
      }),
      // A sync iterator behind `Symbol.asyncIterator` is all `for await` needs, and it keeps the fixture free of
      // Async generators that never await
      listBlobsFlat: () => ({
        byPage: () => ({
          *[Symbol.asyncIterator]() {
            yield { segment: { blobItems: blobNames.map((name) => ({ name, properties: {} })) } };
          },
        }),
        *[Symbol.asyncIterator]() {
          for (const name of blobNames) yield { name, properties: {} };
        },
      }),
      url: containerUrl,
    };
    return { containerClient: containerClient as unknown as ContainerClient, deleteBlobs };
  };

  // A blob name is arbitrary user text, and an interpolated url stops at the first `#` or `?` — the batch would
  // Target a truncated name that does not exist, which `deleteBlobs` reports as a failed sub-response rather than
  // Throwing. The teardown reports success while the real blob survives every later sweep, billed forever.
  test("targets url-escaped blob urls, not interpolated names", async () => {
    expect.hasAssertions();

    const { containerClient, deleteBlobs } = setupContainerClient([`${prefix}/a`, `${prefix}/#`, `${prefix}/?`]);
    await deleteDirectory(containerClient, prefix, true);

    // Every `#`/`?` is percent-encoded, so each url addresses the blob that actually exists
    expect(takeOne(deleteBlobs.mock.calls)[0]).toStrictEqual([
      `${containerUrl}/${prefix}/a`,
      `${containerUrl}/${prefix}/%23`,
      `${containerUrl}/${prefix}/%3F`,
    ]);
  });

  // The sdk rejects an over-sized batch before issuing a single delete, so handing it the whole listing fails the
  // Entire teardown — the purge never reaches its row delete and the resource is stuck in the recycle bin, its
  // Blobs billed forever, with the timer function throwing on every run
  test("splits a directory larger than one batch into waves", async () => {
    expect.hasAssertions();

    const { containerClient, deleteBlobs } = setupContainerClient(
      Array.from({ length: MAX_BLOB_BATCH_DELETIONS + 1 }, (_value, index) => `${prefix}/${index}`),
    );
    await deleteDirectory(containerClient, prefix, true);

    expect(deleteBlobs).toHaveBeenCalledTimes(2);
    expect(takeOne(deleteBlobs.mock.calls)[0]).toHaveLength(MAX_BLOB_BATCH_DELETIONS);
    expect(takeOne(deleteBlobs.mock.calls, 1)[0]).toHaveLength(1);
  });

  // The batch resolves 202 whatever its blobs did, so an unread sub-response is a teardown that reports success
  // While the blob survives — outside every later sweep and billed forever
  test("throws when a blob's own delete fails", async () => {
    expect.hasAssertions();

    const { containerClient } = setupContainerClient([`${prefix}/a`], 403);

    await expect(deleteDirectory(containerClient, prefix, true)).rejects.toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Delete, name: deleteDirectory, 403]`,
    );
  });

  // Every caller is a teardown that must converge when it re-runs, so a blob an earlier attempt already removed
  // Is the state being asked for
  test("treats an already-deleted blob as success", async () => {
    expect.hasAssertions();

    const { containerClient } = setupContainerClient([`${prefix}/a`], 404);

    await expect(deleteDirectory(containerClient, prefix, true)).resolves.toBeUndefined();
  });
});
