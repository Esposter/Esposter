import type { relations } from "@esposter/db-schema";
import type { SQL } from "drizzle-orm";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";

import { storageBlobs, users } from "@esposter/db-schema";
import { eq, sql } from "drizzle-orm";

// The one place bytes leave `users.storageBytesUsed`. The amount is read off the ledger row being dropped
// Rather than recomputed, which is what makes a release idempotent — the row is gone after the first pass, so
// A redelivered deletion event or a replayed sweep decrements nothing a second time. It is also the only way
// A blob can be attributed to an owner at all: a message asset is keyed by room, not by uploader.
// Clamped at zero because drift can only ever be corrected downwards, and a negative total would read back as
// A user who has more allowance than their tier grants.
export const releaseStorageBlobsWhere = (
  db: PostgresJsDatabase<typeof relations>,
  // Undefined is what `and()` collapses to when every operand is, and an unfiltered delete here would empty
  // The ledger for every user — so it is a no-op rather than a filter drizzle would happily drop
  where: SQL | undefined,
): Promise<void> => {
  if (!where) return Promise.resolve();

  return db.transaction(async (tx) => {
    const releasedStorageBlobs = await tx
      .delete(storageBlobs)
      .where(where)
      .returning({ countedBytes: storageBlobs.countedBytes, userId: storageBlobs.userId });
    if (releasedStorageBlobs.length === 0) return;

    // One statement per owner rather than per blob: a prefix release covers a whole directory, and a
    // Deletion event carries hundreds of names, so decrementing row by row is that many round trips
    const releasedBytesMap = new Map<string, number>();
    for (const { countedBytes, userId } of releasedStorageBlobs)
      releasedBytesMap.set(userId, (releasedBytesMap.get(userId) ?? 0) + countedBytes);

    // Sorted because `DELETE ... RETURNING` fixes no row order: two releases over an overlapping set of owners
    // Would otherwise take their `users` locks in opposite orders and deadlock
    for (const [userId, releasedBytes] of [...releasedBytesMap].toSorted(([a], [b]) => a.localeCompare(b)))
      await tx
        .update(users)
        .set({ storageBytesUsed: sql`GREATEST(0, ${users.storageBytesUsed} - ${releasedBytes})` })
        .where(eq(users.id, userId));
  });
};
