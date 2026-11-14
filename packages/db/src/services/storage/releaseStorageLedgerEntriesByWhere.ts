import type { Database, UserInAuth } from "@esposter/db-schema";
import type { SQL } from "drizzle-orm";

import { storageLedgerInStorage, usersInAuth } from "@esposter/db-schema";
import { inArray, sql } from "drizzle-orm";

// The one place bytes leave `users.storageBytesUsed`. The amount is summed off the ledger rows being dropped
// Rather than recomputed, which is what makes a release idempotent — the rows are gone after the first pass, so
// A redelivered deletion event or a replayed sweep decrements nothing a second time. It is also the only way
// A blob can be attributed to an owner at all: a message asset is keyed by room, not by uploader.
// Returns the owners whose counters moved, so a release running outside the app process — the deletion Function —
// Can tell their meters. A release covers a set, so that is a list rather than the reconcile path's single owner.
//
// The counter's update and the row's delete are one batch, with the update first: its subquery reads the rows the
// Delete is about to remove, inside the same transaction, so the sum is exactly what the delete drops
export const releaseStorageLedgerEntriesByWhere = async (
  db: Database,
  // Undefined is what `and()` collapses to when every operand is, and an unfiltered delete here would empty
  // The ledger for every user — so it is a no-op rather than a filter drizzle would happily drop
  where: SQL | undefined,
): Promise<UserInAuth["id"][]> => {
  if (!where) return [];

  const [, releasedStorageLedgerEntries]: [unknown, { userId: UserInAuth["id"] }[]] = await db.batch([
    db
      .update(usersInAuth)
      .set({
        storageBytesUsed: sql`MAX(0, ${usersInAuth.storageBytesUsed} - (SELECT COALESCE(SUM(${storageLedgerInStorage.countedBytes}), 0) FROM ${storageLedgerInStorage} WHERE ${where} AND ${storageLedgerInStorage.userId} = ${usersInAuth.id}))`,
      })
      .where(
        inArray(
          usersInAuth.id,
          db.select({ userId: storageLedgerInStorage.userId }).from(storageLedgerInStorage).where(where),
        ),
      ),
    db.delete(storageLedgerInStorage).where(where).returning({ userId: storageLedgerInStorage.userId }),
  ]);
  return [...new Set(releasedStorageLedgerEntries.map(({ userId }) => userId))];
};
