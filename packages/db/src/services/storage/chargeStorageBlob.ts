import type { AzureContainer, Database, StorageBlob, User } from "@esposter/db-schema";

import { reconcileStorageBlob } from "#src/services/storage/reconcileStorageBlob";
import { storageBlobs } from "@esposter/db-schema";

// The counter's other writer: a blob the server itself wrote, whose size it already knows. There is no SAS and
// So no reserve — the bytes are stored by the time this runs, and the client was never in the data path, so
// There is nothing to gate and nothing to overshoot. It charges after the fact rather than holding space first,
// Which is also why a save is never rejected for being over quota: the upload it would refuse has already
// Happened, and refusing the charge would only make the counter lie. See /docs/platform/storage-quotas
//
// The row is what attributes a blob to an owner, and every release reads its amount off that row — so writing
// One here is what lets `deleteStorageBlobs` and `releaseStorageBlobsByPrefix` give these bytes back with no
// Path of their own. Born already expired: `expiresAt` bounds a write target's life, and this one's write is
// Behind it, so the hold must never count toward another reserve's pending sum.
export const chargeStorageBlob = async (
  db: Database,
  userId: User["id"],
  containerName: AzureContainer,
  blobName: StorageBlob["blobName"],
  actualBytes: number,
): Promise<void> => {
  // Nothing is charged by the insert itself — `countedBytes` starts at zero and the reconcile below moves the
  // Counter by the difference, so a rewrite of the same blob corrects rather than adds, exactly as a second
  // `BlobCreated` for one write target does. A concurrent charge of the same blob finds the row already there
  // And takes the same path.
  await db
    .insert(storageBlobs)
    .values({ blobName, containerName, countedBytes: 0, declaredBytes: 0, expiresAt: new Date(), userId })
    .onConflictDoNothing();
  await reconcileStorageBlob(db, containerName, blobName, actualBytes);
};
