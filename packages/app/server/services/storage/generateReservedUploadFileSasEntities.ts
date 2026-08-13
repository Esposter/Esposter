import type { Context } from "@@/server/trpc/context";
import type { AzureContainer, FileEntity, FileSasEntity, User } from "@esposter/db-schema";

import { useContainerClient } from "@@/server/composables/azure/container/useContainerClient";
import { getStorageBlobReservations } from "@@/server/services/storage/getStorageBlobReservations";
import { reserveStorageBytes } from "@@/server/services/storage/reserveStorageBytes";
import { generateUploadFileSasEntities } from "@esposter/db";

// The upload chokepoint: every write target this app hands out is minted here, and the quota hold for it is
// Taken in the same call. Signing is local and touches nothing in Azure, so the reserve runs after it and
// Before the response — a rejection is a write target the client never receives. Keeping the two in one
// Function is what stops a new upload path from minting SAS urls nothing accounts for.
// See /docs/platform/storage-quotas
export const generateReservedUploadFileSasEntities = async (
  db: Context["db"],
  userId: User["id"],
  containerName: AzureContainer,
  files: Pick<FileEntity, "filename" | "mimetype" | "size">[],
  prefix: string,
): Promise<FileSasEntity[]> => {
  const containerClient = await useContainerClient(containerName);
  const fileSasEntities = await generateUploadFileSasEntities(containerClient, files, prefix);
  await reserveStorageBytes(db, userId, containerName, getStorageBlobReservations(files, fileSasEntities, prefix));
  return fileSasEntities;
};
