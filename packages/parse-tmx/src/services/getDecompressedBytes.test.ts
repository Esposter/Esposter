import { Compression } from "#src/models/Compression";
import { getDecompressedBytes } from "#src/services/getDecompressedBytes";
import { deflateSync, gzipSync } from "node:zlib";
import { describe, expect, test } from "vitest";

describe(getDecompressedBytes, () => {
  const bytes = new Uint8Array([1]);

  test.each([
    [Compression.Gzip, gzipSync],
    [Compression.Zlib, deflateSync],
  ])("decompresses %s", async (compression, compress) => {
    expect.hasAssertions();

    await expect(getDecompressedBytes(new Uint8Array(compress(bytes)), compression)).resolves.toStrictEqual(bytes);
  });
});
