import type { BlobRequestConditions, ContainerClient } from "@azure/storage-blob";

import { checkIsNotFound, checkIsPreconditionFailed } from "@esposter/db";
import { getResultAsync } from "@esposter/shared";

// A blob's bytes read whole, or undefined where nothing is stored under its name or where the conditions fail,
// So a caller holding an etag never reads a blob that has changed since it was checked
export const downloadBlobBytes = async (
  containerClient: ContainerClient,
  blobName: string,
  conditions?: BlobRequestConditions,
): Promise<Buffer | undefined> => {
  const downloaded = await getResultAsync(() =>
    containerClient.getBlockBlobClient(blobName).download(undefined, undefined, { conditions }),
  ).match(
    (response) => response,
    (error) => {
      if (checkIsNotFound(error) || checkIsPreconditionFailed(error)) return undefined;
      throw error;
    },
  );
  if (!downloaded?.readableStreamBody) return undefined;
  return Buffer.concat((await Array.fromAsync(downloaded.readableStreamBody)).map((chunk) => Buffer.from(chunk)));
};
