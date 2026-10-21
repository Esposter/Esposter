import type { ContainerClient } from "@azure/storage-blob";

import { checkIsNotFound } from "@esposter/db";
import { getResultAsync } from "@esposter/shared";

// Moves the blob's last-modified time to now, restarting its grace window. Answers whether there was a blob to move: a
// Blob already gone answers false, so a caller can tell it from a touch that landed, and any other failure rethrows
export const touchResourceAssetBlob = (containerClient: ContainerClient, blobName: string): Promise<boolean> =>
  getResultAsync(() =>
    containerClient.getBlobClient(blobName).setMetadata({ touchedAt: new Date().toISOString() }),
  ).match(
    () => true,
    (error) => {
      if (checkIsNotFound(error)) return false;
      throw error;
    },
  );
