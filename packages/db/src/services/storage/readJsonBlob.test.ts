import { createMockBucket } from "@esposter/db-mock";
import { afterAll, beforeAll, describe, expect, test } from "vitest";

import { readJsonBlob } from "#src/services/storage/readJsonBlob";
import { writeJsonBlob } from "#src/services/storage/writeJsonBlob";

describe(readJsonBlob, () => {
  const blobName = "blobName";
  const serializedJson = JSON.stringify({ a: "a" });
  let bucket: Awaited<ReturnType<typeof createMockBucket>>["bucket"];
  let dispose: () => Promise<void>;

  beforeAll(async () => {
    ({ bucket, dispose } = await createMockBucket("message-assets"));
  });

  afterAll(async () => {
    await dispose();
  });

  // The header is what lets a browser reading through a presigned url receive the JSON rather than the frame
  test("reads back the JSON a write stored as a zstd frame served with Content-Encoding zstd", async () => {
    expect.hasAssertions();

    const stored = await writeJsonBlob(bucket, blobName, serializedJson);
    const object = await bucket.get(blobName);
    const json = await readJsonBlob(bucket, blobName);

    expect(object?.httpMetadata?.contentEncoding).toBe("zstd");
    expect(object?.size).toBe(stored?.size);
    expect(json?.toString()).toBe(serializedJson);
  });

  test("reads a blob never written as undefined", async () => {
    expect.hasAssertions();

    await expect(readJsonBlob(bucket, "neverWritten")).resolves.toBeUndefined();
  });
});
