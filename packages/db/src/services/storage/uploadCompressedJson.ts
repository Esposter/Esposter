import type { R2Bucket, R2Conditional, R2Object } from "@cloudflare/workers-types";

import { omitUndefined } from "@esposter/shared";

// Uploads a frame from compressZstd as a JSON object. A conditional write the object has moved on from resolves to null
// Rather than throwing, so the caller's claim reads the answer directly
export const uploadCompressedJson = (
  bucket: R2Bucket,
  blobName: string,
  compressedJson: Buffer,
  { onlyIf }: { onlyIf?: R2Conditional | undefined } = {},
): Promise<null | R2Object> =>
  bucket.put(blobName, compressedJson, {
    httpMetadata: { contentEncoding: "zstd", contentType: "application/json" },
    ...omitUndefined({ onlyIf }),
  });
