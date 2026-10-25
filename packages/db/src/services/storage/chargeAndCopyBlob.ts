import type { ContainerClient } from "@azure/storage-blob";
import type { AzureContainer, Database, UserInAuth } from "@esposter/db-schema";

import { copyBlob } from "#src/services/azure/container/copyBlob";
import { chargeStorageLedgerEntry } from "#src/services/storage/chargeStorageLedgerEntry";
import { releaseStorageLedgerEntries } from "#src/services/storage/releaseStorageLedgerEntries";
import { getResultAsync, noop } from "@esposter/shared";

// A copy the server makes of a blob it already holds, charged to whoever receives it. The charge is taken before the
// Bytes are written: Event Grid orders nothing, and an event arriving before its row exists is dropped for good. The
// Length is provisional, and the copy's own `BlobCreated` replaces it with the stored size. A copy that fails gives the
// Charge back before its failure is rethrown, so a failed copy leaves nothing counted
export const chargeAndCopyBlob = async (
  db: Database,
  userId: UserInAuth["id"],
  containerName: AzureContainer,
  containerClient: ContainerClient,
  sourceBlobName: string,
  destinationBlobName: string,
  contentLength: number,
): Promise<void> => {
  await chargeStorageLedgerEntry(db, userId, containerName, destinationBlobName, contentLength);
  await getResultAsync(() => copyBlob(containerClient, sourceBlobName, destinationBlobName)).match(
    noop,
    async (error) => {
      await releaseStorageLedgerEntries(db, containerName, [destinationBlobName]);
      throw error;
    },
  );
};
