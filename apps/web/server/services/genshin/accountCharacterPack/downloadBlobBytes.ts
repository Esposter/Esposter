import type { ContainerClient } from "@azure/storage-blob";

import { checkIsNotFound } from "@esposter/db";
import { getResultAsync } from "@esposter/shared";

// A blob's bytes read whole, or undefined where nothing is stored under its name
export const downloadBlobBytes = async (
  containerClient: ContainerClient,
  blobName: string,
): Promise<Buffer | undefined> => {
  const downloaded = await getResultAsync(() => containerClient.getBlockBlobClient(blobName).download()).match(
    (response) => response,
    (error) => {
      if (checkIsNotFound(error)) return undefined;
      throw error;
    },
  );
  if (!downloaded?.readableStreamBody) return undefined;
  return Buffer.concat((await Array.fromAsync(downloaded.readableStreamBody)).map((chunk) => Buffer.from(chunk)));
};
