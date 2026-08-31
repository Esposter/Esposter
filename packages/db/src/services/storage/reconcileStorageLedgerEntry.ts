import type { ReconcileStorageLedgerEntryResult } from "#src/models/storage/ReconcileStorageLedgerEntryResult";
import type { AzureContainer, Database, StorageLedgerEntry } from "@esposter/db-schema";

import { checkIsNewerSequencer } from "#src/services/storage/checkIsNewerSequencer";
import { storageLedger, users } from "@esposter/db-schema";
import { and, eq, sql } from "drizzle-orm";

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
export const reconcileStorageLedgerEntry = (
  db: Database,
  containerName: AzureContainer,
  blobName: StorageLedgerEntry["blobName"],
  actualBytes: number,
  sequencer?: string,
): Promise<ReconcileStorageLedgerEntryResult> =>
  db.transaction(async (tx) => {
    // Locked before the delta is read, so a concurrent reconcile of the same blob cannot read the same
    // `countedBytes` and apply its difference twice
    const [storageLedgerEntry] = await tx
      .select({
        countedBytes: storageLedger.countedBytes,
        sequencer: storageLedger.sequencer,
        userId: storageLedger.userId,
      })
      .from(storageLedger)
      .where(and(eq(storageLedger.containerName, containerName), eq(storageLedger.blobName, blobName)))
      .for("update");
    // A blob nothing reserved — a published or duplicated clone, or anything written outside the upload
    // Chokepoints. Not an error: it is simply not accounted to anyone
    if (!storageLedgerEntry) return { isMatched: false };

    const { countedBytes, sequencer: countedSequencer, userId } = storageLedgerEntry;
    // Two writes are dropped here, and both answer matched — the caller has no other blob-name form to try,
    // And there is nothing left to do with the write either way.
    //
    // An event older than the one already applied is stale, since the newer write's event can land first.
    // A charge is dropped once any event has spoken, because it is a guess about a write storage has already
    // Measured — a charge delayed past a newer write's event would otherwise put back the size that event
    // Superseded. Skipping it costs nothing: every write to this container raises its own event, so the next
    // One settles the blob again.
    // `?? undefined` because a nullable column reads back as `null` — drizzle's boundary, not a shape we pass on
    if (
      sequencer === undefined
        ? countedSequencer !== null
        : !checkIsNewerSequencer(sequencer, countedSequencer ?? undefined)
    )
      return { isMatched: true };

    await tx
      .update(storageLedger)
      // A charge writes no sequencer rather than a null one, so the column keeps meaning "an event has spoken"
      .set({ countedBytes: actualBytes, reconciledAt: new Date(), ...(sequencer !== undefined && { sequencer }) })
      .where(and(eq(storageLedger.containerName, containerName), eq(storageLedger.blobName, blobName)));
    if (actualBytes === countedBytes) return { isMatched: true };

    await tx
      .update(users)
      .set({ storageBytesUsed: sql`GREATEST(0, ${users.storageBytesUsed} + ${actualBytes - countedBytes})` })
      .where(eq(users.id, userId));
    return { chargedUserId: userId, isMatched: true };
  });
