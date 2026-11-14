import type { BlobEntry } from "#src/models/cutover/BlobEntry";

import { ZSTD_CONTENT_ENCODING } from "#src/services/cutover/constants";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { Buffer } from "node:buffer";
import { zstdCompressSync, zstdDecompressSync } from "node:zlib";

// The bytes a textual blob is stored with in R2: its text with every old id rewritten, inside the same compression it
// Was stored with. A blob that names no old id keeps its own bytes, so its MD5 stays Azure's and a re-run skips it
export const toStoredBlobBytes = (blob: BlobEntry, bytes: Buffer, rewrite: (text: string) => string): Buffer => {
  if (blob.contentEncoding !== undefined && blob.contentEncoding !== ZSTD_CONTENT_ENCODING)
    throw new InvalidOperationError(
      Operation.Read,
      blob.name,
      `is encoded as ${blob.contentEncoding}, which the copy cannot rewrite`,
    );

  const isCompressed = blob.contentEncoding === ZSTD_CONTENT_ENCODING;
  const text = (isCompressed ? zstdDecompressSync(bytes) : bytes).toString("utf8");
  const rewritten = rewrite(text);
  if (rewritten === text) return bytes;
  const rewrittenBytes = Buffer.from(rewritten, "utf8");
  return isCompressed ? zstdCompressSync(rewrittenBytes) : rewrittenBytes;
};
