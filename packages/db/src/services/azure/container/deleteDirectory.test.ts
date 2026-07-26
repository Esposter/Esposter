import type { ContainerClient } from "@azure/storage-blob";

import { deleteDirectory } from "@/services/azure/container/deleteDirectory";
import { describe, expect, test, vi } from "vitest";

describe(deleteDirectory, () => {
  const containerUrl = "https://account.blob.core.windows.net/resource-assets";
  const prefix = crypto.randomUUID();

  // A blob name is arbitrary user text, and an interpolated url stops at the first `#` or `?` — the batch would
  // Target a truncated name that does not exist, which `deleteBlobs` reports as a failed sub-response rather than
  // Throwing. The teardown reports success while the real blob survives every later sweep, billed forever.
  test("targets url-escaped blob urls, not interpolated names", async () => {
    expect.hasAssertions();

    const blobNames = [`${prefix}/plain.png`, `${prefix}/my#photo.png`, `${prefix}/a?b.png`];
    const deleteBlobs = vi.fn();
    const containerClient = {
      credential: {},
      getBlobBatchClient: () => ({ deleteBlobs }),
      getBlockBlobClient: (blobName: string) => ({
        url: `${containerUrl}/${blobName.split("/").map(encodeURIComponent).join("/")}`,
      }),
      listBlobsFlat: () => ({
        async *[Symbol.asyncIterator]() {
          for (const name of blobNames) yield { name, properties: {} };
        },
        byPage: () => ({
          async *[Symbol.asyncIterator]() {
            yield { segment: { blobItems: blobNames.map((name) => ({ name, properties: {} })) } };
          },
        }),
      }),
      url: containerUrl,
    };
    await deleteDirectory(containerClient as unknown as ContainerClient, prefix, true);

    // Every `#`/`?` is percent-encoded, so each url addresses the blob that actually exists
    expect(deleteBlobs.mock.calls[0]?.[0]).toStrictEqual([
      `${containerUrl}/${prefix}/plain.png`,
      `${containerUrl}/${prefix}/my%23photo.png`,
      `${containerUrl}/${prefix}/a%3Fb.png`,
    ]);
  });
});
