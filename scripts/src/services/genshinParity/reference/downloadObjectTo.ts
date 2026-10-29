import { sha256File } from "#src/services/genshinParity/reference/sha256File";
import { GAME_DATA_DEV_BASE_URL } from "#src/services/gameData/constants";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { createWriteStream } from "node:fs";
import { rename, rm } from "node:fs/promises";
import type { ReadableStream } from "node:stream/web";

import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";

// One stored object streamed to a file, checked against its hash before it takes the file's name, so a download cut short
// or a changed object is never kept. A recording is never held in memory whole
export const downloadObjectTo = async (blobName: string, destination: string, sha256: string): Promise<void> => {
  const response = await fetch(`${GAME_DATA_DEV_BASE_URL}/${blobName}`);
  if (!response.ok || response.body === null)
    throw new InvalidOperationError(Operation.Read, blobName, `responds ${response.status}`);
  const partPath = `${destination}.part`;
  await pipeline(Readable.fromWeb(response.body as ReadableStream), createWriteStream(partPath));
  if ((await sha256File(partPath)) !== sha256) {
    await rm(partPath, { force: true });
    throw new InvalidOperationError(Operation.Read, blobName, "does not hash to its name");
  }
  await rename(partPath, destination);
};
