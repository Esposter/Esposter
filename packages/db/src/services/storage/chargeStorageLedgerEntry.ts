import type { Database, StorageBucket, StorageLedgerEntryInStorage, UserInAuth } from "@esposter/db-schema";

import { reconcileStorageLedgerEntry } from "#src/services/storage/reconcileStorageLedgerEntry";
import { storageLedgerInStorage } from "@esposter/db-schema";

// The counter's other writer: a blob the server itself wrote, whose size it already knows. There is no presigned url
// And So no reserve — the bytes are stored by the time this runs, and the client was never in the data path, so There
// Is nothing to gate and nothing to overshoot. It charges after the fact rather than holding space first, Which is also
// Why a save is never rejected for being over quota: the upload it would refuse has already Happened, and refusing the
// Charge would only make the counter lie. See openspec/specs/resource/storage-quotas/design.md The amount is
// Provisional: the write raises its own object-create notification, which finds the row this wrote and Replaces the
// Figure with the stored object's real size. It measures where this declares, so it always wins — And it wins by rank
// Rather than by arrival, because storage events are unordered. The event carries its stored Time as its `sequencer`;
// This carries none, which is what marks the figure as a guess. Carrying no position does not make it yield to the last
// Event that spoke, though — `reconcileStorageLedgerEntry` Owns that rule and what it trades, because that is where the
// Ranking happens. The row is what attributes a blob to an owner, and every release reads its amount off that row — so
// Writing One here is what lets `deleteStorageBlobs` and `releaseStorageLedgerEntriesByPrefix` give these bytes back
// With no Path of their own. Born already expired: `expiresAt` bounds a write target's life, and this one's write is
// Behind it, so the hold must never count toward another reserve's pending sum.
export const chargeStorageLedgerEntry = async (
  db: Database,
  userId: UserInAuth["id"],
  storageBucket: StorageBucket,
  blobName: StorageLedgerEntryInStorage["blobName"],
  actualBytes: number,
): Promise<void> => {
  // Nothing is charged by the insert itself — `countedBytes` starts at zero and the reconcile below moves the Counter
  // By the difference, so a rewrite of the same blob corrects rather than adds, exactly as a second Object-create
  // Notification for one write target does. A concurrent charge of the same blob finds the row already there And takes
  // The same path.
  await db
    .insert(storageLedgerInStorage)
    .values({ blobName, countedBytes: 0, declaredBytes: 0, expiresAt: new Date(), storageBucket, userId })
    .onConflictDoNothing();
  await reconcileStorageLedgerEntry(db, storageBucket, blobName, actualBytes);
};
