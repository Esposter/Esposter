import type { AzureContainer, Database, UserInAuth } from "@esposter/db-schema";

import { releaseStorageLedgerEntriesByWhere } from "#src/services/storage/releaseStorageLedgerEntriesByWhere";
import { storageLedgerInStorage } from "@esposter/db-schema";
import { and, eq, sql } from "drizzle-orm";

// The directory-wide release behind `purgeResource`, its only caller — the one teardown that never enumerates
// The names it removes, because it drops the whole `{id}/` directory and the `resources` row it deletes has no
// Foreign key into the ledger. Every other release names its blobs: a prefix blob-deletion event settles
// Through `deleteStorageBlobs`, which releases exactly the names each wave removed.
// `starts_with` rather than LIKE: a prefix is an interpolated path, and `_` in a LIKE pattern is a wildcard
// That would silently widen the release to a sibling directory.
export const releaseStorageLedgerEntriesByPrefix = (
  db: Database,
  containerName: AzureContainer,
  prefix: string,
): Promise<UserInAuth["id"][]> =>
  releaseStorageLedgerEntriesByWhere(
    db,
    and(
      eq(storageLedgerInStorage.containerName, containerName),
      sql`starts_with(${storageLedgerInStorage.blobName}, ${prefix})`,
    ),
  );
