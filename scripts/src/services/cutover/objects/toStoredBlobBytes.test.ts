import type { BlobEntry } from "#src/models/cutover/BlobEntry";

import { ZSTD_CONTENT_ENCODING } from "#src/services/cutover/constants";
import { toStoredBlobBytes } from "#src/services/cutover/objects/toStoredBlobBytes";
import { Buffer } from "node:buffer";
import { zstdCompressSync, zstdDecompressSync } from "node:zlib";
import { describe, expect, test } from "vitest";

const OLD_ID = "old";
const NEW_ID = "new";
const rewrite = (text: string) => text.replaceAll(OLD_ID, NEW_ID);
const compressedBlob: BlobEntry = {
  contentEncoding: ZSTD_CONTENT_ENCODING,
  contentType: "application/json",
  lastModified: new Date(0),
  name: "save.json",
  size: 0,
};

describe(toStoredBlobBytes, () => {
  test("rewrites the ids inside a compressed frame and compresses it again", () => {
    expect.hasAssertions();

    const bytes = toStoredBlobBytes(compressedBlob, zstdCompressSync(Buffer.from(`{"id":"${OLD_ID}"}`)), rewrite);

    expect(zstdDecompressSync(bytes).toString("utf8")).toBe(`{"id":"${NEW_ID}"}`);
  });

  test("keeps the bytes of a blob that names no old id", () => {
    expect.hasAssertions();

    const bytes = zstdCompressSync(Buffer.from("{}"));

    expect(toStoredBlobBytes(compressedBlob, bytes, rewrite)).toBe(bytes);
  });
});
