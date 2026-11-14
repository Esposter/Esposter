import type { Database, StorageBucket, UserInAuth } from "@esposter/db-schema";

import { inJsonArray } from "#src/services/shared/inJsonArray";
import { releaseStorageLedgerEntriesByWhere } from "#src/services/storage/releaseStorageLedgerEntriesByWhere";
import { storageLedgerInStorage } from "@esposter/db-schema";
import { and, eq } from "drizzle-orm";

// Give a named set of blobs' bytes back. One statement per set, so the set is what bounds the bind parameters
// It expands to — deleteStorageBlobs, the only caller, hands it one deletion wave at a time.
export const releaseStorageLedgerEntries = (
  db: Database,
  containerName: StorageBucket,
  blobNames: string[],
): Promise<UserInAuth["id"][]> => {
  if (blobNames.length === 0) return Promise.resolve([]);
  else
    return releaseStorageLedgerEntriesByWhere(
      db,
      and(
        eq(storageLedgerInStorage.containerName, containerName),
        inJsonArray(storageLedgerInStorage.blobName, blobNames),
      ),
    );
};
