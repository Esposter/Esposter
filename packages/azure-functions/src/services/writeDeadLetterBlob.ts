import type { ContainerClient } from "@azure/storage-blob";
// Copy a dead-letter payload under a destination prefix the subscription's advanced filter excludes, so the copy is
// Inspectable without ever retriggering a replay. Deleting the original is the caller's step: one run can write more
// Than one copy (the poison subset under `quarantine/`, what arrived under `archived/`) and the source must survive
// Until all of them land. Carries no attempt counter — the count rides on each event's id (see parseReplayId), so a
// Blob restored back into the container root resumes where it left off with nothing to keep in sync.
export const writeDeadLetterBlob = async (
  containerClient: ContainerClient,
  blobName: string,
  prefix: string,
  content: Buffer,
): Promise<void> => {
  await containerClient.getBlockBlobClient(`${prefix}${blobName}`).upload(content, content.length);
};
