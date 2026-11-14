import { RESOURCE_ASSET_BLOB_NAME_REGEX } from "#src/services/storage/constants";
import { getBucket } from "#src/services/storage/getBucket";
import { findMismatchedResourceAssetHash } from "@esposter/db";
import { StorageBucket, QueueJob } from "@esposter/db-schema";
import { takeOne } from "@esposter/shared";

// A resource asset is addressed by the hash of its bytes, and the client computes that hash and uploads directly, so the
// Bytes are read back and hashed here. A mismatch is deleted rather than kept: nothing may reference bytes under a name that
// Does not describe them. The delete is not best-effort — a failed delete rethrows, and the redelivery repeats the check
export const verifyResourceAssetBlob = async (blobName: string): Promise<void> => {
  const nameMatch = RESOURCE_ASSET_BLOB_NAME_REGEX.exec(blobName);
  if (!nameMatch) return;

  const bucket = getBucket(StorageBucket.ResourceAssets);
  const actualHash = await findMismatchedResourceAssetHash(bucket, blobName, takeOne(nameMatch, 1));
  if (actualHash === undefined) return;

  const mismatch = JSON.stringify({ actualHash, blobName });
  console.error(`${QueueJob.ReconcileStorageLedgerEntry} found a mismatched resource asset: ${mismatch}`);
};
