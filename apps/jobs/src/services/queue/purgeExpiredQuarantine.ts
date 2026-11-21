import { QUARANTINE_PREFIX } from "#src/services/queue/constants";
import { getBucket } from "#src/services/storage/getBucket";
import { deleteBlobs, listBlobNames } from "@esposter/db";
import { QUARANTINE_RETENTION_MS, StorageBucket } from "@esposter/db-schema";

// The nightly purge of quarantined dead letters: every body under the quarantine prefix uploaded past the retention.
// Every expired name is listed before the first is deleted, so a listing that fails leaves every body in place
export const purgeExpiredQuarantine = async (): Promise<void> => {
  const bucket = getBucket(StorageBucket.UserAssets);
  const blobNames = await listBlobNames(bucket, QUARANTINE_PREFIX, {
    createdBefore: new Date(Date.now() - QUARANTINE_RETENTION_MS),
  });
  await deleteBlobs(bucket, blobNames);
};
