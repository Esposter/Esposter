import type { AzureContainer, relations } from "@esposter/db-schema";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";

import { releaseStorageBlobsWhere } from "@/services/storage/releaseStorageBlobsWhere";
import { storageBlobs } from "@esposter/db-schema";
import { and, eq, sql } from "drizzle-orm";

// The directory-wide release behind a purge or an unpublish sweep, where the names are never enumerated.
// `starts_with` rather than LIKE: a prefix is an interpolated path, and `_` in a LIKE pattern is a wildcard
// That would silently widen the release to a sibling directory.
export const releaseStorageBlobsByPrefix = (
  db: PostgresJsDatabase<typeof relations>,
  containerName: AzureContainer,
  prefix: string,
): Promise<void> =>
  releaseStorageBlobsWhere(
    db,
    and(eq(storageBlobs.containerName, containerName), sql`starts_with(${storageBlobs.blobName}, ${prefix})`),
  );
