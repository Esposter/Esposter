import type { AzureContainer, relations } from "@esposter/db-schema";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";

import { releaseStorageBlobsWhere } from "@/services/storage/releaseStorageBlobsWhere";
import { storageBlobs } from "@esposter/db-schema";
import { and, eq, inArray } from "drizzle-orm";

// Give a named set of blobs' bytes back — what every blob deletion funnels through.
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
