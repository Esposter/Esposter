import type { AzureContainer, Database, StorageBlob } from "@esposter/db-schema";

import { storageBlobs, users } from "@esposter/db-schema";
import { and, eq, sql } from "drizzle-orm";

// Storage told us how many bytes actually landed, so the counter takes them. `countedBytes` is what the counter
// Is already carrying for this blob — zero until the first reconcile — and the adjustment is the difference
// Against it, which makes this right in all three cases at once: the first event adds the whole object, a
// Redelivery computes a zero delta instead of double-counting, and a re-upload to the same write target (the
// SAS outlives one PUT) corrects the counter rather than stranding the old size on it.
// Returns whether a ledger row matched, so a caller holding an ambiguous blob name can try its other form.
export const reconcileStorageBlob = (
  db: Database,
  containerName: AzureContainer,
  blobName: StorageBlob["blobName"],
  actualBytes: number,
): Promise<boolean> =>
  db.transaction(async (tx) => {
    // Locked before the delta is read, so a concurrent reconcile of the same blob cannot read the same
    // `countedBytes` and apply its difference twice
    const [storageBlob] = await tx
      .select({ countedBytes: storageBlobs.countedBytes, userId: storageBlobs.userId })
      .from(storageBlobs)
      .where(and(eq(storageBlobs.containerName, containerName), eq(storageBlobs.blobName, blobName)))
      .for("update");
    // A blob nothing reserved — a published or duplicated clone, or anything written outside the upload
    // Chokepoints. Not an error: it is simply not accounted to anyone
    if (!storageBlob) return false;

    const { countedBytes, userId } = storageBlob;
    await tx
      .update(storageBlobs)
      .set({ countedBytes: actualBytes, reconciledAt: new Date() })
      .where(and(eq(storageBlobs.containerName, containerName), eq(storageBlobs.blobName, blobName)));
    if (actualBytes !== countedBytes)
      await tx
        .update(users)
        .set({ storageBytesUsed: sql`GREATEST(0, ${users.storageBytesUsed} + ${actualBytes - countedBytes})` })
        .where(eq(users.id, userId));
    return true;
  });
