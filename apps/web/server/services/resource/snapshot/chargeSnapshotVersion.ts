import type { Context } from "@@/server/trpc/context";
import type { Resource } from "@esposter/db-schema";
import type { WrittenVersion } from "keyframe-store";

import { getSnapshotObjectBlobName } from "@@/server/services/resource/snapshot/getSnapshotObjectBlobName";
import { chargeAndEmitStorageLedgerEntry } from "@@/server/services/storage/chargeAndEmitStorageLedgerEntry";
import { AzureContainer } from "@esposter/db-schema";

// A version is stored bytes the owner keeps, charged for exactly what its object cost rather than for a copy of
// The document — which is what makes the meter say something true: one cell edited costs about a hundred
// Bytes, and a save that changed nothing costs nothing. On the owner rather than the caller, since a restore
// Writes on their behalf. The object's own `BlobCreated` reconciles the figure to what storage recorded, which
// Is the same number (/docs/resource/storage-quotas)
export const chargeSnapshotVersion = async (
  db: Context["db"],
  resource: Pick<Resource, "id" | "userId">,
  { hash, storedBytes }: Pick<WrittenVersion, "hash" | "storedBytes">,
): Promise<void> => {
  if (storedBytes === 0) return;

  await chargeAndEmitStorageLedgerEntry(
    db,
    resource.userId,
    AzureContainer.ResourceAssets,
    getSnapshotObjectBlobName(resource.id, hash),
    storedBytes,
  );
};
