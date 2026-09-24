import type { Database, User } from "@esposter/db-schema";
import type { SQL } from "drizzle-orm";

import { storageLedger, users } from "@esposter/db-schema";
import { eq, sql } from "drizzle-orm";

// The one place bytes leave `users.storageBytesUsed`. The amount is read off the ledger row being dropped
// Rather than recomputed, which is what makes a release idempotent — the row is gone after the first pass, so
// A redelivered deletion event or a replayed sweep decrements nothing a second time. It is also the only way
// A blob can be attributed to an owner at all: a message asset is keyed by room, not by uploader.
// Clamped at zero because drift can only ever be corrected downwards, and a negative total would read back as
// A user who has more allowance than their tier grants.
// Returns the owners whose counters moved, so a release running outside the app process — the deletion Function —
// Can tell their meters. A release covers a set, so that is a list rather than the reconcile path's single owner.
export const releaseStorageLedgerEntriesByWhere = (
  db: Database,
  // Undefined is what `and()` collapses to when every operand is, and an unfiltered delete here would empty
  // The ledger for every user — so it is a no-op rather than a filter drizzle would happily drop
  where: SQL | undefined,
): Promise<User["id"][]> => {
  if (!where) return Promise.resolve([]);

  return db.transaction(async (transaction) => {
    const releasedStorageLedgerEntries = await transaction
      .delete(storageLedger)
      .where(where)
      .returning({ countedBytes: storageLedger.countedBytes, userId: storageLedger.userId });
    if (releasedStorageLedgerEntries.length === 0) return [];
    // One statement per owner rather than per blob: a prefix release covers a whole directory, and a
    // Deletion event carries hundreds of names, so decrementing row by row is that many round trips
    const userIdReleasedBytesMap = new Map<string, number>();
    for (const { countedBytes, userId } of releasedStorageLedgerEntries)
      userIdReleasedBytesMap.set(userId, (userIdReleasedBytesMap.get(userId) ?? 0) + countedBytes);
    // Sorted because `DELETE ... RETURNING` fixes no row order: two releases over an overlapping set of owners
    // Would otherwise take their `users` locks in opposite orders and deadlock
    const releasedUserEntries = [...userIdReleasedBytesMap].toSorted(([firstUserId], [secondUserId]) =>
      firstUserId.localeCompare(secondUserId),
    );
    for (const [userId, releasedBytes] of releasedUserEntries)
      await transaction
        .update(users)
        .set({ storageBytesUsed: sql`GREATEST(0, ${users.storageBytesUsed} - ${releasedBytes})` })
        .where(eq(users.id, userId));
    return releasedUserEntries.map(([userId]) => userId);
  });
};
