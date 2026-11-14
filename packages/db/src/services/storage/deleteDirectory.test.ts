import { deleteDirectory } from "#src/services/storage/deleteDirectory";
import { listBlobNames } from "#src/services/storage/listBlobNames";
import { createMockBucket } from "@esposter/db-mock";
import { settleAll } from "@esposter/shared";
import { afterAll, beforeAll, describe, expect, test } from "vitest";

const MOCK_BUCKET_CONCURRENCY = 50;

describe(deleteDirectory, () => {
  const prefix = "prefix";
  // More than one R2 delete request holds, so the batching is what is tested
  const blobNames = Array.from({ length: 1001 }, (_value, index) => `${prefix}/${index}`);
  let bucket: Awaited<ReturnType<typeof createMockBucket>>["bucket"];
  let dispose: () => Promise<void>;

  beforeAll(async () => {
    ({ bucket, dispose } = await createMockBucket("resource-assets"));
    // Miniflare's proxy refuses a thousand requests opened at once, so the objects are written in waves
    await settleAll(
      blobNames.map((blobName) => () => bucket.put(blobName, "")),
      MOCK_BUCKET_CONCURRENCY,
    );
  });

  afterAll(async () => {
    await dispose();
  });

  test("removes every object under the prefix across batches and leaves the rest", async () => {
    expect.hasAssertions();

    await bucket.put("other/kept", "");
    await deleteDirectory(bucket, prefix);

    await expect(listBlobNames(bucket, prefix)).resolves.toStrictEqual([]);
    await expect(listBlobNames(bucket, "other")).resolves.toStrictEqual(["other/kept"]);
  });
});
