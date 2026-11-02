import type { ContainerClient } from "@azure/storage-blob";

import { checkIsNotFound } from "#src/services/azure/error/checkIsNotFound";
import { checkIsPreconditionFailed } from "#src/services/azure/error/checkIsPreconditionFailed";
import { hashBlobStream } from "#src/services/storage/hashBlobStream";
import { getResultAsync, InvalidOperationError, noop, Operation } from "@esposter/shared";

// A resource asset is addressed by the hash of its bytes, and the client computes that hash and uploads directly, so no
// Name is trusted until the bytes stored under it are read back and hashed. Answers the hash of bytes that do not describe
// The name, after removing them, and undefined when they do or nothing is stored. The removal is conditioned on the etag
// That was hashed, so an upload that took the name after the read is left alone. Any other failed delete rethrows
export const findMismatchedResourceAssetHash = async (
  containerClient: ContainerClient,
  blobName: string,
  expectedHash: string,
): Promise<string | undefined> => {
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);
  const downloaded = await getResultAsync(() => blockBlobClient.download()).match(
    (response) => response,
    (error) => {
      if (checkIsNotFound(error)) return undefined;
      throw error;
    },
  );
  if (!downloaded) return undefined;

  const { etag, readableStreamBody } = downloaded;
  if (!readableStreamBody) throw new InvalidOperationError(Operation.Read, blobName, "returned no body to hash");

  const actualHash = await hashBlobStream(readableStreamBody);
  if (actualHash === expectedHash) return undefined;

  if (!etag) throw new InvalidOperationError(Operation.Read, blobName, "returned no etag to condition the delete on");
  await getResultAsync(() => blockBlobClient.deleteIfExists({ conditions: { ifMatch: etag } })).match(noop, (error) => {
    if (checkIsPreconditionFailed(error)) return undefined;
    throw error;
  });
  return actualHash;
};
