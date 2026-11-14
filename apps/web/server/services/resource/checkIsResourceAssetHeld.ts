import type { R2Bucket } from "@cloudflare/workers-types";

import { touchResourceAssetBlob } from "#server/services/resource/touchResourceAssetBlob";
import { findMismatchedResourceAssetHash } from "@esposter/db";

// A held address is trusted only once the bytes stored under it hash to it. Bytes that do not are removed by the check, so
// The address is not held and is written like any other. A blob that verifies is touched, restarting its grace window
export const checkIsResourceAssetHeld = async (bucket: R2Bucket, blobName: string, hash: string): Promise<boolean> => {
  if ((await findMismatchedResourceAssetHash(bucket, blobName, hash)) !== undefined) return false;
  return touchResourceAssetBlob(bucket, blobName);
};
