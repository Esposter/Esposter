import type { ReconcileStorageLedgerEntryResult } from "#src/models/storage/ReconcileStorageLedgerEntryResult";
import type { Database, StorageBucket, StorageLedgerEntryInStorage } from "@esposter/db-schema";

import { checkIsNewerSequencer } from "#src/services/storage/checkIsNewerSequencer";
import { storageLedgerInStorage, usersInAuth } from "@esposter/db-schema";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { and, eq, exists, isNull, sql } from "drizzle-orm";

// Storage told us how many bytes actually landed, so the counter takes them. `countedBytes` is what the counter
// Is already carrying for this blob — zero until the first reconcile — and the adjustment is the difference
// Against it, which makes this right in all three cases at once: the first event adds the whole object, a
// Redelivery computes a zero delta instead of double-counting, and a re-upload to the same write target (the
// SAS outlives one PUT) corrects the counter rather than stranding the old size on it.
//
// `sequencer` is the event's place in this blob's write order. Event Grid delivers at-least-once and unordered,
// So two writes to one name can have their events arrive reversed — and being idempotent does not save this:
// Replaying the older event is a perfectly well-behaved no-op that still leaves the counter holding a size the
// Blob no longer has. A provisional charge passes none, claiming no position in that order.
// Returns whether a ledger row matched, so a caller holding an ambiguous blob name can try its other form, and
// The owner whose counter this actually moved — the only thing a meter watching the number needs telling about.
//
// The row is read first, and the write is conditional on that read still holding: the counter and the row move in one
// Batch only while the row is in the state the delta was computed from. A reconcile that lost that race throws, so the
// Event is redelivered and computes its delta from the row as it now stands.
export const reconcileStorageLedgerEntry = async (
  db: Database,
  containerName: StorageBucket,
  blobName: StorageLedgerEntryInStorage["blobName"],
  actualBytes: number,
  sequencer?: string,
): Promise<ReconcileStorageLedgerEntryResult> => {
  const storageLedgerEntryWhere = and(
    eq(storageLedgerInStorage.containerName, containerName),
    eq(storageLedgerInStorage.blobName, blobName),
  );
  const [storageLedgerEntry] = await db
    .select({
      countedBytes: storageLedgerInStorage.countedBytes,
      sequencer: storageLedgerInStorage.sequencer,
      userId: storageLedgerInStorage.userId,
    })
    .from(storageLedgerInStorage)
    .where(storageLedgerEntryWhere);
  // A blob nothing reserved — a published or duplicated clone, or anything written outside the upload
  // Chokepoints. Not an error: it is simply not accounted to anyone
  if (!storageLedgerEntry) return { isMatched: false };

  const { countedBytes, sequencer: countedSequencer, userId } = storageLedgerEntry;
  // A stale event is dropped here and still answers matched — the caller has no other blob-name form to try,
  // And there is nothing left to do with an event older than the one already applied, which happens because
  // The newer write's event can land first.
  //
  // A charge passes no sequencer and is applied whatever the row has already seen. It cannot yield to the
  // Last event that spoke: the blob it measures is rewritten under one name on every save, so a charge that
  // Stood down after the blob's first event would leave every save after the first counted only by its own
  // Event — seconds later, from the Functions host, and not at all in the request the owner is watching.
  // What that trades is a charge delayed past a *newer* write's event putting its own size back; the next
  // Save's charge corrects it rather than stranding it, because the same name is written again. The one
  // Charge whose figure is a guess about a write the server did not make — a clone — is charged before its
  // Copy, so its own event always lands behind it and measures over it.
  // `?? undefined` because a nullable column reads back as `null` — drizzle's boundary, not a shape we pass on
  if (sequencer !== undefined && !checkIsNewerSequencer(sequencer, countedSequencer ?? undefined))
    return { isMatched: true };

  const isReadState = and(
    storageLedgerEntryWhere,
    eq(storageLedgerInStorage.countedBytes, countedBytes),
    countedSequencer === null
      ? isNull(storageLedgerInStorage.sequencer)
      : eq(storageLedgerInStorage.sequencer, countedSequencer),
  );
  const [, updatedStorageLedgerEntries] = await db.batch([
    // The counter moves by the difference, and only while the row still holds the state it was computed from
    db
      .update(usersInAuth)
      .set({ storageBytesUsed: sql`MAX(0, ${usersInAuth.storageBytesUsed} + ${actualBytes - countedBytes})` })
      .where(
        and(
          eq(usersInAuth.id, userId),
          exists(
            db
              .select({ one: sql`1` })
              .from(storageLedgerInStorage)
              .where(isReadState),
          ),
        ),
      ),
    // A charge writes no sequencer rather than a null one, so the column keeps meaning "an event has spoken"
    db
      .update(storageLedgerInStorage)
      .set({ countedBytes: actualBytes, reconciledAt: new Date(), ...(sequencer !== undefined && { sequencer }) })
      .where(isReadState)
      .returning({ userId: storageLedgerInStorage.userId }),
  ]);
  if (updatedStorageLedgerEntries.length === 0)
    throw new InvalidOperationError(Operation.Update, blobName, "changed while it was being reconciled");
  if (actualBytes === countedBytes) return { isMatched: true };

  return { chargedUserId: userId, isMatched: true };
};
