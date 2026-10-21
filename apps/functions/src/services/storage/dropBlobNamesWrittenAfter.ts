import type { ContainerClient } from "@azure/storage-blob";

import { checkIsNotFound } from "@esposter/db";
import { MAX_CONCURRENT_BLOB_COPIES } from "@esposter/db-schema";
import { getResultAsync, settleAll } from "@esposter/shared";

// A named deletion judged its blobs unreferenced at `decidedAt`. A blob last written after that — a dedupe touching a
// Re-uploaded file, or a copy re-referencing it — is one the decision never saw, so a late or replayed delivery keeps
// It. A blob already gone has no time to compare and stays in the set, so its storage ledger row is released exactly
// As a missing blob always has been
export const dropBlobNamesWrittenAfter = async (
  containerClient: ContainerClient,
  blobNames: string[],
  decidedAt: Date | undefined,
): Promise<string[]> => {
  if (!decidedAt) return blobNames;

  const lastModifiedEntries = await settleAll(
    blobNames.map(
      (blobName) => () =>
        getResultAsync(() => containerClient.getBlobClient(blobName).getProperties()).match(
          (properties) => ({ blobName, lastModified: properties.lastModified }),
          (error) => {
            if (checkIsNotFound(error)) return { blobName, lastModified: undefined };
            throw error;
          },
        ),
    ),
    MAX_CONCURRENT_BLOB_COPIES,
  );
  return lastModifiedEntries
    .filter(({ lastModified }) => lastModified === undefined || lastModified.getTime() <= decidedAt.getTime())
    .map(({ blobName }) => blobName);
};
