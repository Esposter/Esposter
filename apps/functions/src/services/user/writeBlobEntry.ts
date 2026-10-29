import type { UserDataArchive } from "#src/models/user/UserDataArchive";
import type { ContainerClient } from "@azure/storage-blob";

import { InvalidOperationError, Operation } from "@esposter/shared";

// A blob's bytes stream into its entry as they are read, so an attachment is never held whole.
// A missing blob fails the read.
// That fails the export rather than leaving its entry out of an archive that reads as complete.
export const writeBlobEntry = async (
  archive: UserDataArchive,
  entryName: string,
  containerClient: ContainerClient,
  blobName: string,
): Promise<void> => {
  const { readableStreamBody } = await containerClient.getBlobClient(blobName).download();
  if (!readableStreamBody)
    throw new InvalidOperationError(Operation.Read, blobName, "has no body to stream into the archive");
  await archive.addEntry(entryName, readableStreamBody);
};
