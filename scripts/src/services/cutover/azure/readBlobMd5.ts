import type { ContainerClient } from "@azure/storage-blob";

import { downloadBlobBody } from "#src/services/cutover/azure/downloadBlobBody";
import { MD5_ALGORITHM } from "#src/services/cutover/constants";
import { createHash } from "node:crypto";

// The MD5 of a blob's bytes as hex, streamed so the blob is never held whole. Used for a blob Azure stored no digest for
export const readBlobMd5 = async (containerClient: ContainerClient, name: string): Promise<string> => {
  const body = await downloadBlobBody(containerClient, name);
  const hash = createHash(MD5_ALGORITHM);
  for await (const chunk of body) hash.update(chunk);
  return hash.digest("hex");
};
