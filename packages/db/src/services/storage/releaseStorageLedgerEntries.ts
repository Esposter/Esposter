import type { AzureContainer, Database, User } from "@esposter/db-schema";

import { releaseStorageLedgerEntriesByWhere } from "#src/services/storage/releaseStorageLedgerEntriesByWhere";
import { storageLedger } from "@esposter/db-schema";
import { and, eq, inArray } from "drizzle-orm";

// Give a named set of blobs' bytes back. One statement per set, so the set is what bounds the bind parameters
// It expands to — deleteStorageBlobs, the only caller, hands it one deletion wave at a time.
export const releaseStorageLedgerEntries = (
  db: Database,
  containerName: AzureContainer,
  blobNames: string[],
): Promise<User["id"][]> => {
  if (blobNames.length === 0) return Promise.resolve([]);
  else
    return releaseStorageLedgerEntriesByWhere(
      db,
      and(eq(storageLedger.containerName, containerName), inArray(storageLedger.blobName, blobNames)),
    );
};
