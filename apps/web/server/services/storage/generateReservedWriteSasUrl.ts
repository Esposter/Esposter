import type { Context } from "@@/server/trpc/context";
import type { AzureContainer, User } from "@esposter/db-schema";

import { useContainerClient } from "@@/server/composables/azure/container/useContainerClient";
import { reserveStorageBytes } from "@@/server/services/storage/reserveStorageBytes";
import { generateWriteSasUrl } from "@esposter/db";

// The upload chokepoint for a write target whose name the server fixes rather than mints per upload — a
// Resource's staging blob. Signed and reserved in one call for the reason `generateReservedUploadFileSasEntities`
// Is: a write target nothing accounts for cannot be handed out. See /docs/resource/storage-quotas
export const generateReservedWriteSasUrl = async (
  db: Context["db"],
  userId: User["id"],
  containerName: AzureContainer,
  blobName: string,
  declaredBytes: number,
): Promise<string> => {
  const containerClient = await useContainerClient(containerName);
  const sasUrl = await generateWriteSasUrl(containerClient.getBlockBlobClient(blobName));
  await reserveStorageBytes(db, userId, containerName, [{ blobName, declaredBytes }]);
  return sasUrl;
};
