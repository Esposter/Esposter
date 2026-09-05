import type { ContainerClient } from "@azure/storage-blob";

import { cloneFiles } from "#src/services/azure/container/cloneFiles";
import { AzureContainer, FileEntity } from "@esposter/db-schema";
import { ID_SEPARATOR, takeOne } from "@esposter/shared";
import { describe, expect, test, vi } from "vitest";

describe(cloneFiles, () => {
  const containerUrl = `https://account.blob.core.windows.net/${AzureContainer.MessageAssets}`;
  const sourcePrefix = crypto.randomUUID();
  const destinationPrefix = crypto.randomUUID();
  const id = crypto.randomUUID();
  const filename = "a";

  // Records the copy source the destination client was handed, which is the whole invariant: it has to be
  // The SDK's own percent-encoded url and never an interpolation of the raw name. `rejectSource` fails the one copy
  // Whose source ends with it, so a partial clone can be driven without faking the client's shape.
  const setupContainerClient = (rejectSource = "") => {
    const beginCopyFromURL = vi.fn<(copySource: string) => Promise<{ pollUntilDone: () => Promise<void> }>>(
      (copySource) =>
        rejectSource && copySource.endsWith(rejectSource)
          ? Promise.reject(new Error("CannotVerifyCopySource"))
          : Promise.resolve({ pollUntilDone: () => Promise.resolve() }),
    );
    const deletedBlobNames: string[] = [];
    const containerClient = {
      getBlockBlobClient: (blobName: string) => ({
        beginCopyFromURL,
        deleteIfExists: () => {
          deletedBlobNames.push(blobName);
          return Promise.resolve({ succeeded: true });
        },
        url: `${containerUrl}/${blobName
          .split("/")
          .map((segment) => encodeURIComponent(segment))
          .join("/")}`,
      }),
      url: containerUrl,
    } as unknown as ContainerClient;
    return { beginCopyFromURL, containerClient, deletedBlobNames };
  };

  test("copies from the sdk's encoded url, so a name holding a url delimiter is not truncated", async () => {
    expect.hasAssertions();

    const { beginCopyFromURL, containerClient } = setupContainerClient();

    await cloneFiles(containerClient, [new FileEntity({ filename: "#", id })], sourcePrefix, destinationPrefix);

    // Interpolated, the `#` would start a fragment and Azure would receive a source ending at the separator.
    expect(beginCopyFromURL).toHaveBeenCalledWith(`${containerUrl}/${sourcePrefix}/${id}%7C%23`);
  });

  test("copies the sibling thumbnail and reports it, so a clone never claims one that was not written", async () => {
    expect.hasAssertions();

    const { beginCopyFromURL, containerClient } = setupContainerClient();

    const [clonedFile] = await cloneFiles(
      containerClient,
      [new FileEntity({ filename, hasThumbnail: true, id })],
      sourcePrefix,
      destinationPrefix,
    );

    expect(clonedFile?.hasThumbnail).toBe(true);
    expect(beginCopyFromURL).toHaveBeenCalledWith(`${containerUrl}/${sourcePrefix}/${id}.thumb`);
  });

  // The caller treats a rejection as "nothing was cloned" — the forward posts no message — so anything already
  // Written is referenced by nothing, and the retry mints a fresh id rather than overwriting it.
  test("clears what it wrote when the thumbnail copy fails", async () => {
    expect.hasAssertions();

    const { containerClient, deletedBlobNames } = setupContainerClient(".thumb");

    await expect(
      cloneFiles(
        containerClient,
        [new FileEntity({ filename, hasThumbnail: true, id })],
        sourcePrefix,
        destinationPrefix,
      ),
    ).rejects.toThrow("CannotVerifyCopySource");

    expect(deletedBlobNames).toHaveLength(1);
    expect(takeOne(deletedBlobNames).endsWith(`${ID_SEPARATOR}${filename}`)).toBe(true);
  });

  test("clears a sibling's clone when another file in the batch fails", async () => {
    expect.hasAssertions();

    const failingId = crypto.randomUUID();
    const failingFilename = "b";
    // The copy source is the percent-encoded url, so the suffix has to be encoded the same way the client is
    const { containerClient, deletedBlobNames } = setupContainerClient(
      encodeURIComponent(`${failingId}${ID_SEPARATOR}${failingFilename}`),
    );

    await expect(
      cloneFiles(
        containerClient,
        [new FileEntity({ filename, id }), new FileEntity({ filename: failingFilename, id: failingId })],
        sourcePrefix,
        destinationPrefix,
      ),
    ).rejects.toThrow("CannotVerifyCopySource");

    // Only the sibling that landed — the failing copy wrote nothing to clear
    expect(deletedBlobNames).toHaveLength(1);
    expect(takeOne(deletedBlobNames).endsWith(`${ID_SEPARATOR}${filename}`)).toBe(true);
  });

  test("copies only the original when the source recorded no thumbnail", async () => {
    expect.hasAssertions();

    const { beginCopyFromURL, containerClient } = setupContainerClient();

    const [clonedFile] = await cloneFiles(
      containerClient,
      [new FileEntity({ filename, id })],
      sourcePrefix,
      destinationPrefix,
    );

    expect(clonedFile?.hasThumbnail).toBe(false);
    expect(beginCopyFromURL).toHaveBeenCalledTimes(1);
  });
});
