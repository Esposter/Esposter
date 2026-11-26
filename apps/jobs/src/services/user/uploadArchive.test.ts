/* oxlint-disable typescript/require-await -- An AsyncIterable is what uploadArchive reads, and only an async
   generator yields one */
import { uploadArchive } from "#src/services/user/uploadArchive";
import { setupMockBucket } from "@esposter/db-mock/vitest";
import { StorageBucket } from "@esposter/db-schema";
import { InvalidOperationError, KIBIBYTE, Operation } from "@esposter/shared";
import { assert, describe, expect, test } from "vitest";

const toChunks = async function* (chunks: Uint8Array[]) {
  for (const chunk of chunks) yield chunk;
};

describe(uploadArchive, () => {
  // Above R2's minimum for a part, so each full chunk is a part of its own
  const chunkBytes = 6 * KIBIBYTE * KIBIBYTE;
  const failingArchive = async function* () {
    yield new Uint8Array(chunkBytes);
    throw new InvalidOperationError(Operation.Create, "archive", "stopped after its first part");
  };
  const { getBucket } = setupMockBucket(StorageBucket.UserAssets);

  test("stores the chunks as one object, sent in parts", async () => {
    expect.hasAssertions();

    const chunks = [1, 2].map((byte) => new Uint8Array(chunkBytes).fill(byte));
    await uploadArchive(getBucket(), "archive.zip", toChunks(chunks));

    const archiveObject = await getBucket().get("archive.zip");
    assert.exists(archiveObject);
    // Compared as bytes in one native pass, since an element-wise equality over 12 MiB runs near the test's timeout
    expect(Buffer.from(await archiveObject.arrayBuffer()).equals(Buffer.concat(chunks))).toBe(true);
  });

  // A part already sent when the archive fails is never completed, so no object stands in its place
  test("leaves no object when the archive fails after a part is sent", async () => {
    expect.hasAssertions();

    await expect(
      uploadArchive(getBucket(), "abandoned.zip", failingArchive()),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Create, name: archive, stopped after its first part]`,
    );
    await expect(getBucket().get("abandoned.zip")).resolves.toBeNull();
  });
});
