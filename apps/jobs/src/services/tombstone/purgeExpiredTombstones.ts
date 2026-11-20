import { getDb } from "#src/services/shared/getDb";
import { OVERLAY_TOMBSTONE_TABLES, TOMBSTONE_RETENTION_MS } from "@esposter/db-schema";
import { getResultAsync, noop } from "@esposter/shared";
import { and, getTableName, isNotNull, lt } from "drizzle-orm";

// The nightly purge of the overlay's tombstones: every row soft-deleted past the tombstone retention, in each table the
// Overlay soft-deletes. A tombstone is hidden from every read and from the view, so its removal changes no view and
// Publishes no topic, and no reader is woken to fetch it. A table that fails is logged, and the others still run
export const purgeExpiredTombstones = async (): Promise<void> => {
  const cutoff = new Date(Date.now() - TOMBSTONE_RETENTION_MS);
  await Promise.all(
    OVERLAY_TOMBSTONE_TABLES.map((table) =>
      getResultAsync(() =>
        getDb()
          .delete(table)
          .where(and(isNotNull(table.deletedAt), lt(table.deletedAt, cutoff))),
      ).match(noop, (error) => {
        console.error(`purgeExpiredTombstones failed for ${getTableName(table)}:`, error);
      }),
    ),
  );
};
