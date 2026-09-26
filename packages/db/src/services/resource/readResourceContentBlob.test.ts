import type { BlockBlobUploadOptions, ContainerClient } from "@azure/storage-blob";

import { readResourceContentBlob } from "#src/services/resource/readResourceContentBlob";
import { writeResourceContentBlob } from "#src/services/resource/writeResourceContentBlob";
import { RestError } from "@azure/core-rest-pipeline";
import { describe, expect, test } from "vitest";

describe(readResourceContentBlob, () => {
  const resourceId = crypto.randomUUID();
  const serializedContent = JSON.stringify({ a: "a" });
  // Keeps what each upload was handed, headers included, and refuses a read of a name never written the way
  // Storage does
  const setupContainerClient = () => {
    const blobs = new Map<string, { body: Buffer; options?: BlockBlobUploadOptions }>();
    const containerClient = {
      getBlockBlobClient: (blobName: string) => ({
        downloadToBuffer: () => {
          const blob = blobs.get(blobName);
          if (!blob) return Promise.reject(new RestError(" ", { statusCode: 404 }));
          return Promise.resolve(blob.body);
        },
        upload: (body: Buffer, _contentLength: number, options?: BlockBlobUploadOptions) => {
          blobs.set(blobName, { body, options });
          return Promise.resolve();
        },
      }),
    } as unknown as ContainerClient;
    return { blobs, containerClient };
  };

  // The header is what lets a browser reading through a SAS receive the JSON rather than the frame
  test("reads back the JSON a write stored as a zstd frame served with Content-Encoding zstd", async () => {
    expect.hasAssertions();

    const { blobs, containerClient } = setupContainerClient();
    const storedContentSize = await writeResourceContentBlob(containerClient, resourceId, serializedContent);
    const [blob] = blobs.values();
    const content = await readResourceContentBlob(containerClient, resourceId);

    expect(blob?.options?.blobHTTPHeaders?.blobContentEncoding).toBe("zstd");
    expect(blob?.body.byteLength).toBe(storedContentSize);
    expect(content?.toString()).toBe(serializedContent);
  });

  test("reads a resource never saved as no content", async () => {
    expect.hasAssertions();

    const { containerClient } = setupContainerClient();

    await expect(readResourceContentBlob(containerClient, resourceId)).resolves.toBeUndefined();
  });
});
