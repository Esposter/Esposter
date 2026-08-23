import type { AzureContainer, Database } from "@esposter/db-schema";

import { releaseStorageBlobsWhere } from "#src/services/storage/releaseStorageBlobsWhere";
import { storageBlobs } from "@esposter/db-schema";
import { and, eq, sql } from "drizzle-orm";

// The directory-wide release behind `purgeResource`, its only caller — the one teardown that never enumerates
// The names it removes, because it drops the whole `{id}/` directory and the `resources` row it deletes has no
// Foreign key into the ledger. Every other release names its blobs: a prefix blob-deletion event settles
// Through `deleteStorageBlobs`, which releases exactly the names each wave removed.
// `starts_with` rather than LIKE: a prefix is an interpolated path, and `_` in a LIKE pattern is a wildcard
// That would silently widen the release to a sibling directory.
export const releaseStorageBlobsByPrefix = (
  db: Database,
  containerName: AzureContainer,
  prefix: string,
): Promise<void> =>
  releaseStorageBlobsWhere(
    db,
    and(eq(storageBlobs.containerName, containerName), sql`starts_with(${storageBlobs.blobName}, ${prefix})`),
  );
