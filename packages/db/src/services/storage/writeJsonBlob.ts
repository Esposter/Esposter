import type { R2Bucket, R2Conditional, R2Object } from "@cloudflare/workers-types";

import { compressZstd } from "#src/services/storage/compressZstd";
import { uploadCompressedJson } from "#src/services/storage/uploadCompressedJson";

// The one way a JSON document is stored: compressed at the default level and uploaded, so a browser reading it through a
// Presigned url receives the JSON while every server reader decompresses it itself (readJsonBlob). Returns the stored
// Object, whose size is what an owner is charged, or null when `onlyIf` refused the write over an object that changed
export const writeJsonBlob = async (
  bucket: R2Bucket,
  blobName: string,
  serializedJson: string,
  onlyIf?: R2Conditional,
): Promise<null | R2Object> => uploadCompressedJson(bucket, blobName, await compressZstd(serializedJson), { onlyIf });
