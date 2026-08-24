import type { AzureContainer, Database, StorageLedgerEntry } from "@esposter/db-schema";

import { getIsNewerSequencer } from "#src/services/storage/getIsNewerSequencer";
import { storageLedger, users } from "@esposter/db-schema";
import { and, eq, sql } from "drizzle-orm";

// Storage told us how many bytes actually landed, so the counter takes them. `countedBytes` is what the counter
// Is already carrying for this blob — zero until the first reconcile — and the adjustment is the difference
// Against it, which makes this right in all three cases at once: the first event adds the whole object, a
// Redelivery computes a zero delta instead of double-counting, and a re-upload to the same write target (the
// SAS outlives one PUT) corrects the counter rather than stranding the old size on it.
//
// `sequencer` is the event's place in this blob's write order, and an event older than the one already applied
// Is dropped. Event Grid delivers at-least-once and unordered, so two saves to one name can have their events
// Arrive reversed — and being idempotent does not save this: replaying the older event is a perfectly
// Well-behaved no-op that still leaves the counter holding a size the blob no longer has. A provisional charge
// Passes none, claiming no position in that order: it writes bytes the next event supersedes.
// Returns whether a ledger row matched, so a caller holding an ambiguous blob name can try its other form.
export const reconcileStorageLedgerEntry = (
  db: Database,
  containerName: AzureContainer,
  blobName: StorageLedgerEntry["blobName"],
  actualBytes: number,
  sequencer?: string,
): Promise<boolean> =>
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
    if (!storageLedgerEntry) return false;

    const { countedBytes, sequencer: countedSequencer, userId } = storageLedgerEntry;
    // The row matched, so the caller has no other name to try — a superseded event is answered like an applied
    // One, because it found its row and there is nothing left to do with it
    // Coalesced because a nullable column reads back as `null` — the boundary drizzle owns, not a shape we pass on
    if (sequencer !== undefined && !getIsNewerSequencer(sequencer, countedSequencer ?? undefined)) return true;

    await tx
      .update(storageLedger)
      // A charge carries no sequencer and must not clear the position an event already recorded, or the next
      // Stale event would compare against nothing and be applied
      .set({ countedBytes: actualBytes, reconciledAt: new Date(), ...(sequencer !== undefined && { sequencer }) })
      .where(and(eq(storageLedger.containerName, containerName), eq(storageLedger.blobName, blobName)));
    if (actualBytes !== countedBytes)
      await tx
        .update(users)
        .set({ storageBytesUsed: sql`GREATEST(0, ${users.storageBytesUsed} + ${actualBytes - countedBytes})` })
        .where(eq(users.id, userId));
    return true;
  });
