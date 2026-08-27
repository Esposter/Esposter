import type { ContainerClient } from "@azure/storage-blob";

import { checkIsConflict } from "@esposter/db";
import { getResultAsync } from "@esposter/shared";
// Copy a dead-letter payload under a destination prefix the subscription's advanced filter excludes, so the copy is
// Inspectable without ever retriggering a replay. Deleting the original is the caller's step: one run can write more
// Than one copy (the poison subset under `quarantine/`, what arrived under `archived/`) and the source must survive
// Until all of them land. Carries no attempt counter — the count rides on each event's id (see parseReplayId), so a
// Blob restored back into the container root resumes where it left off with nothing to keep in sync.
// Returns whether this call created the copy rather than overwriting one an earlier delivery already wrote: the
// Destination path is deterministic, so rewriting identical bytes is harmless, but a caller announcing the copy must
// Only announce it once — every delivery of the same blob would otherwise repeat that announcement.
export const writeDeadLetterBlob = (
  containerClient: ContainerClient,
  blobName: string,
  prefix: string,
  content: Buffer,
): Promise<boolean> => {
  const blockBlobClient = containerClient.getBlockBlobClient(`${prefix}${blobName}`);
  // `ifNoneMatch: "*"` makes the create atomic. Reading existence first and then uploading lets two concurrent
  // Deliveries of the same blob both see nothing and both report the copy as theirs, which announces one poison
  // Payload twice. The path and the bytes are both deterministic, so losing the race means the copy is already
  // There, exactly as this call would have written it
  return getResultAsync(() =>
    blockBlobClient.upload(content, content.length, { conditions: { ifNoneMatch: "*" } }),
  ).match(
    () => true,
    (error) => {
      if (checkIsConflict(error)) return false;
      throw error;
    },
  );
};
