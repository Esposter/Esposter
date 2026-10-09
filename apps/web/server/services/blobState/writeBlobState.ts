import type { ContainerClient } from "@azure/storage-blob";

import { checkIsConflict, checkIsPreconditionFailed, writeJsonBlob } from "@esposter/db";
import { getResultAsync } from "@esposter/shared";
import { TRPCError } from "@trpc/server";

// Writes a blob's JSON under the ETag its caller read: the write lands only while the blob still carries that ETag, and
// An absent one means the blob must not exist yet. A write refused for either is a CONFLICT, because the blob changed
// Since it was read, and the caller answers it by reading again
export const writeBlobState = async (
  containerClient: ContainerClient,
  blobName: string,
  serializedJson: string,
  etag: string | undefined,
): Promise<string | undefined> => {
  const conditions = etag === undefined ? { ifNoneMatch: "*" } : { ifMatch: etag };
  const written = await getResultAsync(() =>
    writeJsonBlob(containerClient, blobName, serializedJson, conditions),
  ).match(
    (result) => result,
    (error) => {
      if (checkIsPreconditionFailed(error) || checkIsConflict(error))
        throw new TRPCError({ code: "CONFLICT", message: "The save changed since it was read" });
      throw error;
    },
  );
  return written.etag;
};
