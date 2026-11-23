import { createMemoryR2BucketClient } from "#src/services/cloudflare/createMemoryR2BucketClient.test";
import { getHostedAssetKey } from "#src/services/hostedAssets/getHostedAssetKey";
import { readHostedAssetBytes } from "#src/services/hostedAssets/readHostedAssetBytes";
import { TEST_FILENAME } from "#src/services/shared/fixtureConstants.test";
import { getContentAddress } from "@esposter/shared-node/cache";
import { describe, expect, test } from "vitest";

describe(readHostedAssetBytes, () => {
  const bytes = Buffer.from(TEST_FILENAME);
  const object = { bytes: bytes.byteLength, extension: ".png", scope: TEST_FILENAME, sha256: getContentAddress(bytes) };

  test("a pulled object hashes to its key", async () => {
    expect.hasAssertions();

    const bucketClient = createMemoryR2BucketClient();
    await bucketClient.put(getHostedAssetKey(object), bytes);

    expect(getContentAddress(await readHostedAssetBytes(bucketClient, object))).toBe(object.sha256);
  });

  test("a mismatched object is refused on read back", async () => {
    expect.hasAssertions();

    const bucketClient = createMemoryR2BucketClient();
    await bucketClient.put(getHostedAssetKey(object), Buffer.from("b"));

    await expect(readHostedAssetBytes(bucketClient, object)).rejects.toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: a/ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb.png, does not hash to its name]`,
    );
  });
});
