import type { ContainerClient } from "@azure/storage-blob";
import type { Resource } from "@esposter/db-schema";

import { getContentBlobName } from "#src/services/azure/container/getContentBlobName";
import { checkIsNotFound } from "#src/services/azure/error/checkIsNotFound";
import { getResultAsync } from "@esposter/shared";
import { promisify } from "node:util";
import { zstdDecompress } from "node:zlib";

const decompress = promisify(zstdDecompress);
// The working copy as the JSON bytes `contentHash` names, decompressed from the frame writeResourceContentBlob
// Stored. A missing blob reads as "no content yet" — a resource created and never saved — while every other
// Failure surfaces rather than passing for an empty document
export const readResourceContentBlob = async (
  containerClient: ContainerClient,
  resourceId: Resource["id"],
): Promise<Buffer | undefined> => {
  const compressedContent = await getResultAsync(() =>
    containerClient.getBlockBlobClient(getContentBlobName(resourceId)).downloadToBuffer(),
  ).match(
    (content) => content,
    (error) => {
      if (checkIsNotFound(error)) return undefined;
      throw error;
    },
  );
  if (compressedContent) return decompress(compressedContent);
  else return undefined;
};
