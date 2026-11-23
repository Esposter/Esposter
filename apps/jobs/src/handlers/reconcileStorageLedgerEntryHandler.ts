import { getDb } from "#src/services/shared/getDb";
import { broadcastStorageUsage } from "#src/services/storage/broadcastStorageUsage";
import { verifyResourceAssetBlob } from "#src/services/storage/verifyResourceAssetBlob";
import { reconcileStorageLedgerEntry } from "@esposter/db";
import { r2ObjectCreatedQueueMessageSchema, StorageBucket, storageBucketSchema } from "@esposter/db-schema";

// The object-create notification is what turns a client's declared size into the truth. It arrives after the PUT lands
// And carries the stored object's real size. It reports what happened on a data path our servers are never part of. The
// Ledger row names the bucket and the blob, so each notification is matched against its own row: one from a bucket
// Nothing reserves into finds no row. No list of buckets is kept beside the reserve writers, so none can drift from
// Them. The row names whose allowance a blob is charged to: a resource asset's owner, or a message attachment's
// Uploader. See openspec/specs/resource/storage-quotas/design.md
export const reconcileStorageLedgerEntryHandler = async (body: unknown): Promise<void> => {
  const { bucket, eventTime, object } = r2ObjectCreatedQueueMessageSchema.parse(body);
  // The notification names its bucket as any string, and a name the storage enum does not declare has no row to find
  const { data: storageBucket } = storageBucketSchema.safeParse(bucket);
  if (!storageBucket) return;

  // R2 gives no per-object ordering token, so the notification's own time orders two writes to one name.
  // A reconcile applies a notification only when it is newer than the one already applied
  const { chargedUserId } = await reconcileStorageLedgerEntry(
    getDb(),
    storageBucket,
    object.key,
    object.size,
    eventTime,
  );
  if (chargedUserId) await broadcastStorageUsage([chargedUserId]);
  // Verified after the ledger step so a mismatched blob is charged before its deletion raises an object-delete
  // Notification, which Releases the charge
  if (storageBucket === StorageBucket.ResourceAssets) await verifyResourceAssetBlob(object.key);
};
