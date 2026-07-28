import type { ContainerClient } from "@azure/storage-blob";

import { cloneFiles } from "@/services/azure/container/cloneFiles";
import { AzureContainer, FileEntity } from "@esposter/db-schema";
import { describe, expect, test, vi } from "vitest";

describe(cloneFiles, () => {
  const containerUrl = `https://account.blob.core.windows.net/${AzureContainer.MessageAssets}`;
  const sourcePrefix = crypto.randomUUID();
  const destinationPrefix = crypto.randomUUID();
  const id = crypto.randomUUID();

  // Records the copy source the destination client was handed, which is the whole invariant: it has to be the
  // Sdk's own percent-encoded url and never an interpolation of the raw name.
  const setupContainerClient = () => {
    const beginCopyFromURL = vi.fn<(copySource: string) => Promise<{ pollUntilDone: () => Promise<void> }>>(() =>
      Promise.resolve({ pollUntilDone: () => Promise.resolve() }),
    );
    const containerClient = {
      getBlockBlobClient: (blobName: string) => ({
        beginCopyFromURL,
        url: `${containerUrl}/${blobName
          .split("/")
          .map((segment) => encodeURIComponent(segment))
          .join("/")}`,
      }),
      url: containerUrl,
    } as unknown as ContainerClient;
    return { beginCopyFromURL, containerClient };
  };

  test("copies from the sdk's encoded url, so a name holding a url delimiter is not truncated", async () => {
    expect.hasAssertions();

    const { beginCopyFromURL, containerClient } = setupContainerClient();
    const filename = "report#1.pdf";

    await cloneFiles(containerClient, [new FileEntity({ filename, id })], sourcePrefix, destinationPrefix);

    // Interpolated, the `#` would start a fragment and Azure would receive a source ending at `report`.
    expect(beginCopyFromURL).toHaveBeenCalledWith(`${containerUrl}/${sourcePrefix}/${id}%7Creport%231.pdf`);
  });

  test("copies the sibling thumbnail and reports it, so a clone never claims one that was not written", async () => {
    expect.hasAssertions();

    const { beginCopyFromURL, containerClient } = setupContainerClient();
    const filename = "photo.png";

    const [clonedFile] = await cloneFiles(
      containerClient,
      [new FileEntity({ filename, hasThumbnail: true, id })],
      sourcePrefix,
      destinationPrefix,
    );

    expect(clonedFile?.hasThumbnail).toBe(true);
    expect(beginCopyFromURL).toHaveBeenCalledWith(`${containerUrl}/${sourcePrefix}/${id}.thumb`);
  });

  test("copies only the original when the source recorded no thumbnail", async () => {
    expect.hasAssertions();

    const { beginCopyFromURL, containerClient } = setupContainerClient();

    const [clonedFile] = await cloneFiles(
      containerClient,
      [new FileEntity({ filename: "notes.txt", id })],
      sourcePrefix,
      destinationPrefix,
    );

    expect(clonedFile?.hasThumbnail).toBe(false);
    expect(beginCopyFromURL).toHaveBeenCalledTimes(1);
  });
});
