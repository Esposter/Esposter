import type { ContainerClient } from "@azure/storage-blob";

import { checkIsNotFound } from "@esposter/db";
import { getResultAsync } from "@esposter/shared";

// A blob's stored length, read without its bytes, or undefined where nothing is stored under its name
export const getBlobContentLength = (containerClient: ContainerClient, blobName: string): Promise<number | undefined> =>
  getResultAsync(() => containerClient.getBlockBlobClient(blobName).getProperties()).match(
    ({ contentLength }) => contentLength,
    (error) => {
      if (checkIsNotFound(error)) return undefined;
      throw error;
    },
  );
