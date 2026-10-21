import type { InvocationContext } from "@azure/functions";

import { getContainerClient } from "#src/services/azure/getContainerClient";
import { RESOURCE_ASSET_BLOB_NAME_REGEX } from "#src/services/storage/constants";
import { hashBlobStream } from "#src/services/storage/hashBlobStream";
import { checkIsNotFound, checkIsPreconditionFailed } from "@esposter/db";
import { AzureContainer, AzureFunction } from "@esposter/db-schema";
import { getResultAsync, InvalidOperationError, Operation, takeOne } from "@esposter/shared";

// A resource asset is addressed by the hash of its bytes, and the client computes that hash and uploads directly, so
// The bytes are read back and hashed here. A mismatch is deleted rather than kept: nothing may reference bytes under a
// Name that does not describe them. The delete is not best-effort — a failed delete rethrows, and the redelivery
// Repeats the check, so the blob cannot stay behind unnoticed
export const verifyResourceAssetBlob = async (context: InvocationContext, blobName: string): Promise<void> => {
  const nameMatch = RESOURCE_ASSET_BLOB_NAME_REGEX.exec(blobName);
  if (!nameMatch) return;

  const expectedHash = takeOne(nameMatch, 1);
  const containerClient = await getContainerClient(AzureContainer.ResourceAssets);
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);
  const downloaded = await getResultAsync(() => blockBlobClient.download()).match(
    (response) => response,
    (error) => {
      // Deleted since the event was raised — a redelivery after a mismatch was removed, or a blob removed by hand
      if (checkIsNotFound(error)) return undefined;
      throw error;
    },
  );
  if (!downloaded) return;

  const { readableStreamBody } = downloaded;
  if (!readableStreamBody) throw new InvalidOperationError(Operation.Read, blobName, "returned no body to hash");

  const actualHash = await hashBlobStream(readableStreamBody);
  if (actualHash === expectedHash) return;

  // Conditional on the etag that was hashed: a legitimate upload that took this name after the read has a new etag, and
  // A refused delete is that upload winning, so it is left alone rather than retried
  if (!downloaded.etag)
    throw new InvalidOperationError(Operation.Read, blobName, "returned no etag to condition the delete on");
  const isDeleted = await getResultAsync(() =>
    blockBlobClient.deleteIfExists({ conditions: { ifMatch: downloaded.etag } }),
  ).match(
    () => true,
    (error) => {
      if (checkIsPreconditionFailed(error)) return false;
      throw error;
    },
  );
  if (!isDeleted) return;

  const mismatch = JSON.stringify({ actualHash, blobName });
  context.error(`${AzureFunction.ReconcileStorageLedgerEntry} deleted a mismatched resource asset: ${mismatch}`);
};
