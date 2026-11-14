import type { DataExportInUser } from "@esposter/db-schema";

import { getStorageCredentials } from "#server/services/storage/getStorageCredentials";
import { DATA_EXPORT_LINK_DURATION_MS } from "#server/services/user/constants";
import { getInvalidOperationError } from "#server/trpc/guards/getInvalidOperationError";
import { createPresignedGetUrl } from "@esposter/db";
import { StorageBucket, DatabaseEntityType, DataExportStatus } from "@esposter/db-schema";
import { Operation } from "@esposter/shared";

// Refused for every state but a ready export that has not expired and names its archive. The expiry is checked here
// As well as by the blob's lifecycle rule, since a blob the rule has not reached yet still exists after its expiry
export const getDataExportLink = async ({ blobName, expiresAt, id, status }: DataExportInUser) => {
  if (status !== DataExportStatus.Ready || !blobName || !expiresAt || expiresAt <= new Date())
    throw getInvalidOperationError(Operation.Read, DatabaseEntityType.DataExport, id);

  return createPresignedGetUrl(getStorageCredentials(), StorageBucket.UserAssets, blobName, {
    expiresInMs: DATA_EXPORT_LINK_DURATION_MS,
  });
};
