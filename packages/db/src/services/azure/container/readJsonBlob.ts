import type { ContainerClient } from "@azure/storage-blob";

import { checkIsNotFound } from "#src/services/azure/error/checkIsNotFound";
import { getResultAsync } from "@esposter/shared";
import { promisify } from "node:util";
import { zstdDecompress } from "node:zlib";

const decompress = promisify(zstdDecompress);
// A JSON document as the bytes it was serialized to, decompressed from the frame writeJsonBlob stored. A missing
// Blob reads as undefined — nothing saved yet — while every other failure surfaces rather than passing for an
// Empty document
export const readJsonBlob = async (containerClient: ContainerClient, blobName: string): Promise<Buffer | undefined> => {
  const compressedJson = await getResultAsync(() =>
    containerClient.getBlockBlobClient(blobName).downloadToBuffer(),
  ).match(
    (json) => json,
    (error) => {
      if (checkIsNotFound(error)) return undefined;
      throw error;
    },
  );
  if (compressedJson) return decompress(compressedJson);
  else return undefined;
};
