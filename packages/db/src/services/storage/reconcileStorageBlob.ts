import type { AzureContainer, relations, StorageBlob } from "@esposter/db-schema";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";

import { storageBlobs, users } from "@esposter/db-schema";
import { and, eq, isNull, sql } from "drizzle-orm";

// Replaces what the client declared with what is actually stored. Conditional on the row still being
// Unreconciled, so a replayed sweep is a no-op rather than a second adjustment; a row that matches nothing
// Leaves the counter alone. Until this runs, `countedBytes` is still `declaredBytes` — the reserve wrote both
// From the same number and nothing else moves either — so the declaration is what the counter is holding and
// The difference against it is the whole adjustment.
export const reconcileStorageBlob = (
  db: PostgresJsDatabase<typeof relations>,
  containerName: AzureContainer,
  blobName: StorageBlob["blobName"],
  actualBytes: number,
): Promise<void> =>
  db.transaction(async (tx) => {
    const [reconciledStorageBlob] = await tx
      .update(storageBlobs)
      .set({ countedBytes: actualBytes, reconciledAt: new Date() })
      .where(
        and(
          eq(storageBlobs.containerName, containerName),
          eq(storageBlobs.blobName, blobName),
          isNull(storageBlobs.reconciledAt),
        ),
      )
      .returning({ declaredBytes: storageBlobs.declaredBytes, userId: storageBlobs.userId });
    if (!reconciledStorageBlob) return;

    const { declaredBytes, userId } = reconciledStorageBlob;
    await tx
      .update(users)
      .set({ storageBytesUsed: sql`GREATEST(0, ${users.storageBytesUsed} + ${actualBytes - declaredBytes})` })
      .where(eq(users.id, userId));
  });
