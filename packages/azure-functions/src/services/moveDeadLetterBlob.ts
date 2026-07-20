import type { ContainerClient } from "@azure/storage-blob";

import { REPLAY_ATTEMPTS_METADATA_KEY } from "@/services/constants";

// Copy-then-delete keeps the payload inspectable under its new prefix while guaranteeing the original can
// Never retrigger replay — the subscription's advanced filter excludes both destination prefixes. The attempt
// Counter rides along on the copy so a blob restored back into the container root resumes where it left off.
export const moveDeadLetterBlob = async (
  containerClient: ContainerClient,
  blobName: string,
  prefix: string,
  content: Buffer,
  replayAttempts: number,
): Promise<void> => {
  await containerClient.getBlockBlobClient(`${prefix}${blobName}`).upload(content, content.length, {
    metadata: { [REPLAY_ATTEMPTS_METADATA_KEY]: String(replayAttempts) },
  });
  await containerClient.getBlockBlobClient(blobName).delete();
};
