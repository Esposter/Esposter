import { encodeHostedAssetObject } from "#src/services/hostedAssets/encodeHostedAssetObject";
import { TEST_FILENAME } from "#src/services/shared/fixtureConstants.test";
import { getContentAddress } from "@esposter/shared-node/cache";
import { brotliDecompressSync } from "node:zlib";
import { describe, expect, test } from "vitest";

describe(encodeHostedAssetObject, () => {
  test("a published tsx is stored brotli-encoded, and its decoded bytes hash to its name", async () => {
    expect.hasAssertions();

    const bytes = Buffer.from(TEST_FILENAME);
    const { body, contentEncoding } = await encodeHostedAssetObject(".tsx", bytes);

    expect(contentEncoding).toBe("br");
    expect(getContentAddress(brotliDecompressSync(body))).toBe(getContentAddress(bytes));
  });

  test("a png is stored as its own bytes with no encoding", async () => {
    expect.hasAssertions();

    const bytes = Buffer.from(TEST_FILENAME);

    await expect(encodeHostedAssetObject(".png", bytes)).resolves.toStrictEqual({
      body: bytes,
      contentEncoding: undefined,
    });
  });
});
