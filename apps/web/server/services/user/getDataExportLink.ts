import type { DataExportInUser } from "@esposter/db-schema";

import { useContainerClient } from "#server/composables/azure/container/useContainerClient";
import { DATA_EXPORT_LINK_DURATION_MS } from "#server/services/user/constants";
import { getInvalidOperationError } from "#server/trpc/guards/getInvalidOperationError";
import { generateReadSasUrl } from "@esposter/db";
import { AzureContainer, DatabaseEntityType, DataExportStatus } from "@esposter/db-schema";
import { Operation } from "@esposter/shared";

// Refused for every state but a ready export that has not expired and names its archive. The expiry is checked here
// As well as by the blob's lifecycle rule, since a blob the rule has not reached yet still exists after its expiry
export const getDataExportLink = async ({ blobName, expiresAt, id, status }: DataExportInUser) => {
  if (status !== DataExportStatus.Ready || !blobName || !expiresAt || expiresAt <= new Date())
    throw getInvalidOperationError(Operation.Read, DatabaseEntityType.DataExport, id);

  const containerClient = await useContainerClient(AzureContainer.UserAssets);
  return generateReadSasUrl(containerClient.getBlockBlobClient(blobName), {
    expiresOn: new Date(Date.now() + DATA_EXPORT_LINK_DURATION_MS),
  });
};
