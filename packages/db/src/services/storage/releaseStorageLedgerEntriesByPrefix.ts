import type { Database, StorageBucket, UserInAuth } from "@esposter/db-schema";

import { releaseStorageLedgerEntriesByWhere } from "#src/services/storage/releaseStorageLedgerEntriesByWhere";
import { storageLedgerInStorage } from "@esposter/db-schema";
import { and, eq, sql } from "drizzle-orm";

// The directory-wide release behind `purgeResource`, its only caller — the one teardown that never enumerates The names
// It removes, because it drops the whole `{id}/` directory and the `resources` row it deletes has no Foreign key into
// The ledger. Every other release names its blobs: a prefix blob-deletion event settles Through `deleteStorageBlobs`,
// Which releases exactly the names each wave removed. `substr` of the prefix's own length rather than LIKE: a prefix is
// An interpolated path, and `_` in a LIKE pattern is a wildcard That would silently widen the release to a sibling
// Directory, and SQLite has no `starts_with` to reach for instead.
export const releaseStorageLedgerEntriesByPrefix = (
  db: Database,
  storageBucket: StorageBucket,
  prefix: string,
): Promise<UserInAuth["id"][]> =>
  releaseStorageLedgerEntriesByWhere(
    db,
    and(
      eq(storageLedgerInStorage.storageBucket, storageBucket),
      sql`substr(${storageLedgerInStorage.blobName}, 1, length(${prefix})) = ${prefix}`,
    ),
  );
