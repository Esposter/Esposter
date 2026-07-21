import type { ContainerClient } from "@azure/storage-blob";
// Copy a dead-letter payload under a destination prefix the subscription's advanced filter excludes, so the copy is
// Inspectable without ever retriggering a replay. Deleting the original is the caller's step: one run can write more
// Than one copy (the poison subset under `quarantine/`, what arrived under `archived/`) and the source must survive
// Until all of them land. Carries no attempt counter — the count rides on each event's id (see parseReplayId), so a
// Blob restored back into the container root resumes where it left off with nothing to keep in sync.
// Returns whether this call created the copy rather than overwriting one an earlier delivery already wrote: the
// Destination path is deterministic, so rewriting identical bytes is harmless, but a caller announcing the copy must
// Only announce it once — every delivery of the same blob would otherwise repeat that announcement.
export const writeDeadLetterBlob = async (
  containerClient: ContainerClient,
  blobName: string,
  prefix: string,
  content: Buffer,
): Promise<boolean> => {
  const blockBlobClient = containerClient.getBlockBlobClient(`${prefix}${blobName}`);
  const isCreated = !(await blockBlobClient.exists());
  await blockBlobClient.upload(content, content.length);
  return isCreated;
};
