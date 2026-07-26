import type { ContainerClient } from "@azure/storage-blob";

import { deleteDirectory } from "@/services/azure/container/deleteDirectory";
import { MAX_BLOB_BATCH_DELETIONS } from "@esposter/db-schema";
import { describe, expect, test, vi } from "vitest";

describe(deleteDirectory, () => {
  const containerUrl = "https://account.blob.core.windows.net/resource-assets";
  const prefix = crypto.randomUUID();

  const setupContainerClient = (blobNames: string[]) => {
    const deleteBlobs = vi.fn<ContainerClient["getBlobBatchClient"]>();
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
    expect(deleteBlobs.mock.calls[0]?.[0]).toStrictEqual([
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
    expect(deleteBlobs.mock.calls[0]?.[0]).toHaveLength(MAX_BLOB_BATCH_DELETIONS);
    expect(deleteBlobs.mock.calls[1]?.[0]).toHaveLength(1);
  });
});
