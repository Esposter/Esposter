import type { AzureContainer, Database, StorageLedgerEntry, User } from "@esposter/db-schema";

import { reconcileStorageLedgerEntry } from "#src/services/storage/reconcileStorageLedgerEntry";
import { storageLedger } from "@esposter/db-schema";

// The counter's other writer: a blob the server itself wrote, whose size it already knows. There is no SAS and
// So no reserve — the bytes are stored by the time this runs, and the client was never in the data path, so
// There is nothing to gate and nothing to overshoot. It charges after the fact rather than holding space first,
// Which is also why a save is never rejected for being over quota: the upload it would refuse has already
// Happened, and refusing the charge would only make the counter lie. See /docs/platform/storage-quotas
//
// The amount is provisional: the write raises its own `BlobCreated`, which finds the row this wrote and
// Replaces the figure with the stored object's real size. It measures where this declares, so it always wins —
// And it wins by rank rather than by arrival, because Event Grid orders nothing. The event carries storage's
// Per-blob `sequencer`; this carries none, which is what marks the figure as a guess.
//
// Carrying no position does not make it yield to the last event that spoke, though — `reconcileStorageLedgerEntry`
// Owns that rule and what it trades, because that is where the ranking happens.
//
// The row is what attributes a blob to an owner, and every release reads its amount off that row — so writing
// One here is what lets `deleteStorageBlobs` and `releaseStorageLedgerEntriesByPrefix` give these bytes back with no
// Path of their own. Born already expired: `expiresAt` bounds a write target's life, and this one's write is
// Behind it, so the hold must never count toward another reserve's pending sum.
export const chargeStorageLedgerEntry = async (
  db: Database,
  userId: User["id"],
  containerName: AzureContainer,
  blobName: StorageLedgerEntry["blobName"],
  actualBytes: number,
): Promise<void> => {
  // Nothing is charged by the insert itself — `countedBytes` starts at zero and the reconcile below moves the
  // Counter by the difference, so a rewrite of the same blob corrects rather than adds, exactly as a second
  // `BlobCreated` for one write target does. A concurrent charge of the same blob finds the row already there
  // And takes the same path.
  await db
    .insert(storageLedger)
    .values({ blobName, containerName, countedBytes: 0, declaredBytes: 0, expiresAt: new Date(), userId })
    .onConflictDoNothing();
  await reconcileStorageLedgerEntry(db, containerName, blobName, actualBytes);
};
