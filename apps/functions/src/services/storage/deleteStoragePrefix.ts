import type { InvocationContext } from "@azure/functions";
import type { AzureContainer } from "@esposter/db-schema";

import { getContainerClient } from "#src/services/azure/getContainerClient";
import { db } from "#src/services/shared/db";
import { broadcastStorageUsage } from "#src/services/storage/broadcastStorageUsage";
import { deleteStorageBlobs, listBlobNames } from "@esposter/db";

// Deletes every blob under a prefix the way a prefix blob-deletion event does: each blob's ledger row gives its bytes back
// To whoever was charged for it, and every owner it gave bytes back to is told. A room's attachments are charged to the
// Members who uploaded them, so the release cannot be skipped the way a bare directory teardown skips it
export const deleteStoragePrefix = async (
  context: InvocationContext,
  containerName: AzureContainer,
  prefix: string,
): Promise<void> => {
  const containerClient = await getContainerClient(containerName);
  const blobNames = await listBlobNames(containerClient, prefix);
  await deleteStorageBlobs(db, containerClient, containerName, blobNames, (releasedUserIds) =>
    broadcastStorageUsage(context, releasedUserIds),
  );
};
