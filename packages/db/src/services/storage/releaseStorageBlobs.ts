import type { AzureContainer, relations } from "@esposter/db-schema";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";

import { releaseStorageBlobsWhere } from "@/services/storage/releaseStorageBlobsWhere";
import { storageBlobs } from "@esposter/db-schema";
import { and, eq, inArray } from "drizzle-orm";

// Give a named set of blobs' bytes back. One statement per set, so the set is what bounds the bind parameters
// It expands to — deleteStorageBlobs, the only caller, hands it one deletion wave at a time.
export const releaseStorageBlobs = (
  db: PostgresJsDatabase<typeof relations>,
  containerName: AzureContainer,
  blobNames: string[],
): Promise<void> => {
  if (blobNames.length === 0) return Promise.resolve();

  return releaseStorageBlobsWhere(
    db,
    and(eq(storageBlobs.containerName, containerName), inArray(storageBlobs.blobName, blobNames)),
  );
};
