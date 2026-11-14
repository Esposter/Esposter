import { db } from "#src/services/shared/db";
import { broadcastStorageUsage } from "#src/services/storage/broadcastStorageUsage";
import { verifyResourceAssetBlob } from "#src/services/storage/verifyResourceAssetBlob";
import { reconcileStorageLedgerEntry } from "@esposter/db";
import { r2ObjectCreatedQueueMessageSchema, StorageBucket } from "@esposter/db-schema";

// The object-create notification is what turns a client's declared size into the truth.
// It arrives after the PUT lands and carries the stored object's real size.
// It reports what happened on a data path our servers are never part of.
// Every bucket a reserve writes into is listed here, and the notifications come from those buckets only.
// So an object from anywhere else is dropped rather than mis-attributed.
// The row names whose allowance a blob is charged to: a resource asset's owner, or a message attachment's uploader.
// See openspec/specs/resource/storage-quotas/design.md
const STORAGE_BLOB_CONTAINERS = [StorageBucket.ResourceAssets, StorageBucket.MessageAssets];

export const reconcileStorageLedgerEntryHandler = async (body: unknown): Promise<void> => {
  const { bucket, eventTime, object } = r2ObjectCreatedQueueMessageSchema.parse(body);
  const containerName = STORAGE_BLOB_CONTAINERS.find((storageBlobContainer) => storageBlobContainer === bucket);
  if (!containerName) return;

  // R2 gives no per-object ordering token, so the notification's own time orders two writes to one name.
  // A reconcile applies a notification only when it is newer than the one already applied
  const { chargedUserId } = await reconcileStorageLedgerEntry(db, containerName, object.key, object.size, eventTime);
  if (chargedUserId) await broadcastStorageUsage([chargedUserId]);
  // Verified after the ledger step so a mismatched blob is charged before its deletion raises BlobDeleted, which
  // Releases the charge
  if (containerName === StorageBucket.ResourceAssets) await verifyResourceAssetBlob(object.key);
};
