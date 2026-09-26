import type { BlockBlobUploadOptions, ContainerClient } from "@azure/storage-blob";

import { readJsonBlob } from "#src/services/azure/container/readJsonBlob";
import { writeJsonBlob } from "#src/services/azure/container/writeJsonBlob";
import { RestError } from "@azure/core-rest-pipeline";
import { describe, expect, test } from "vitest";

// Keeps what each upload was handed, headers included, and refuses a read of a name never written the way
// Storage does
const setupContainerClient = () => {
  const blobs = new Map<string, { body: Buffer; options?: BlockBlobUploadOptions }>();
  const containerClient = {
    getBlockBlobClient: (name: string) => ({
      downloadToBuffer: () => {
        const blob = blobs.get(name);
        if (!blob) return Promise.reject(new RestError(" ", { statusCode: 404 }));
        return Promise.resolve(blob.body);
      },
      upload: (body: Buffer, _contentLength: number, options?: BlockBlobUploadOptions) => {
        blobs.set(name, { body, options });
        return Promise.resolve();
      },
    }),
  } as unknown as ContainerClient;
  return { blobs, containerClient };
};

describe(readJsonBlob, () => {
  const blobName = "blobName";
  const serializedJson = JSON.stringify({ a: "a" });

  // The header is what lets a browser reading through a SAS receive the JSON rather than the frame
  test("reads back the JSON a write stored as a zstd frame served with Content-Encoding zstd", async () => {
    expect.hasAssertions();

    const { blobs, containerClient } = setupContainerClient();
    const storedByteLength = await writeJsonBlob(containerClient, blobName, serializedJson);
    const blob = blobs.get(blobName);
    const json = await readJsonBlob(containerClient, blobName);

    expect(blob?.options?.blobHTTPHeaders?.blobContentEncoding).toBe("zstd");
    expect(blob?.body.byteLength).toBe(storedByteLength);
    expect(json?.toString()).toBe(serializedJson);
  });

  test("reads a blob never written as undefined", async () => {
    expect.hasAssertions();

    const { containerClient } = setupContainerClient();

    await expect(readJsonBlob(containerClient, blobName)).resolves.toBeUndefined();
  });
});
