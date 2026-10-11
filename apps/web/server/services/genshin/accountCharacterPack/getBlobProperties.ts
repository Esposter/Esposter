import type { ContainerClient } from "@azure/storage-blob";

import { checkIsNotFound } from "@esposter/db";
import { getResultAsync } from "@esposter/shared";

// A blob's stored length and etag, read without its bytes, or undefined where nothing is stored under its name
export const getBlobProperties = (
  containerClient: ContainerClient,
  blobName: string,
): Promise<undefined | { contentLength: number; etag: string }> =>
  getResultAsync(() => containerClient.getBlockBlobClient(blobName).getProperties()).match(
    ({ contentLength, etag }) =>
      contentLength === undefined || etag === undefined ? undefined : { contentLength, etag },
    (error) => {
      if (checkIsNotFound(error)) return undefined;
      throw error;
    },
  );
