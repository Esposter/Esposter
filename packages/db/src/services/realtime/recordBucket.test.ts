import type { RecordedBlobs } from "#src/models/realtime/RecordedBlobs";

import { recordBucket } from "#src/services/realtime/recordBucket";
import { createMockBucket } from "@esposter/db-mock";
import { topicSchema } from "@esposter/db-schema";
import { afterAll, beforeAll, describe, expect, test } from "vitest";

describe(recordBucket, () => {
  const bucketName = "USER_ASSETS";
  let mockBucket: Awaited<ReturnType<typeof createMockBucket>>;

  beforeAll(async () => {
    mockBucket = await createMockBucket(bucketName);
  });

  afterAll(async () => {
    await mockBucket.dispose();
  });

  // A read names the key it reads, and a listing names the directory its prefix lies in, so a write beneath the prefix wakes it
  test("a get and a head record the key they read, and a list records the directory its prefix lies in", async () => {
    expect.hasAssertions();

    const blobs: RecordedBlobs = { reads: [], writes: [] };
    const bucket = recordBucket(mockBucket.bucket, bucketName, () => blobs);

    await bucket.get("user/a/one");
    await bucket.head("user/a/one");
    await bucket.list({ prefix: "user/a/o" });

    expect(blobs.reads).toStrictEqual([
      `${bucketName}:user/a/one`,
      `${bucketName}:user/a/one`,
      `${bucketName}:user/a/`,
    ]);
  });

  // A write publishes its key, every directory above it and the bucket's root, so a listing of any of them is woken, and a
  // Delete publishes the same
  test("a put publishes its key, each directory above it and the bucket's root, and a delete the same", async () => {
    expect.hasAssertions();

    const blobs: RecordedBlobs = { reads: [], writes: [] };
    const bucket = recordBucket(mockBucket.bucket, bucketName, () => blobs);
    const published = [`${bucketName}:user/a/one`, `${bucketName}:user/a/`, `${bucketName}:user/`, `${bucketName}:`];

    await bucket.put("user/a/one", "x");
    await bucket.delete("user/a/one");

    expect(blobs.writes).toStrictEqual([...published, ...published]);
  });

  // The bucket's root is the topic with an empty key, so every name a write publishes must be one the topic schema accepts.
  // A name it rejects fails only its own object's publish, and the rest of the write still publishes
  test("every topic a write publishes is one the topic schema accepts, the bucket's root included", async () => {
    expect.hasAssertions();

    const blobs: RecordedBlobs = { reads: [], writes: [] };
    const bucket = recordBucket(mockBucket.bucket, bucketName, () => blobs);

    await bucket.put("user/a/one", "x");

    expect(blobs.writes.filter((topic) => !topicSchema.safeParse(topic).success)).toStrictEqual([]);
  });

  // A blob's key is named whole in its topic, and a file's key runs to the longest name a file takes, so a key of that length
  // Still publishes a topic the schema accepts
  test("a key as long as a file's name publishes a topic the schema accepts", async () => {
    expect.hasAssertions();

    const blobs: RecordedBlobs = { reads: [], writes: [] };
    const bucket = recordBucket(mockBucket.bucket, bucketName, () => blobs);

    await bucket.put(`user/${"a".repeat(1000)}`, "x");

    expect(blobs.writes.filter((topic) => !topicSchema.safeParse(topic).success)).toStrictEqual([]);
  });
});
