import type { BlobEntry } from "#src/models/cutover/BlobEntry";
import type { ContainerClient } from "@azure/storage-blob";

import { readBlobMd5 } from "#src/services/cutover/azure/readBlobMd5";
import { MD5_ALGORITHM } from "#src/services/cutover/constants";
import { base64ToHex } from "#src/services/cutover/objects/base64ToHex";
import { checkIsTextualBlob } from "#src/services/cutover/objects/checkIsTextualBlob";
import { readStoredBlobBytes } from "#src/services/cutover/objects/readStoredBlobBytes";
import { createHash } from "node:crypto";

// The size and MD5 an object holds: a textual blob's bytes as the copy stored them, its ids rewritten.
// Any other blob's own size and digest, or a digest hashed from its bytes when Azure stored none
export const readExpectedObject = async (
  containerClient: ContainerClient,
  blob: BlobEntry,
  rewrite: (text: string) => string,
): Promise<{ md5: string; size: number }> => {
  if (checkIsTextualBlob(blob)) {
    const bytes = await readStoredBlobBytes(containerClient, blob, rewrite);
    return { md5: createHash(MD5_ALGORITHM).update(bytes).digest("hex"), size: bytes.byteLength };
  }
  return {
    md5: blob.md5 === undefined ? await readBlobMd5(containerClient, blob.name) : base64ToHex(blob.md5),
    size: blob.size,
  };
};
