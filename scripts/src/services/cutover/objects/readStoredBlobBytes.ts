import type { BlobEntry } from "#src/models/cutover/BlobEntry";
import type { ContainerClient } from "@azure/storage-blob";

import { downloadBlobBody } from "#src/services/cutover/azure/downloadBlobBody";
import { toStoredBlobBytes } from "#src/services/cutover/objects/toStoredBlobBytes";
import { Buffer } from "node:buffer";

// A textual blob downloaded whole and turned into the bytes it is stored with in R2. Only a textual blob is read this
// Way, since it is small and must be rewritten as a whole
export const readStoredBlobBytes = async (
  containerClient: ContainerClient,
  blob: BlobEntry,
  rewrite: (text: string) => string,
): Promise<Buffer> => {
  const chunks: Buffer[] = [];
  for await (const chunk of await downloadBlobBody(containerClient, blob.name)) chunks.push(Buffer.from(chunk));
  return toStoredBlobBytes(blob, Buffer.concat(chunks), rewrite);
};
