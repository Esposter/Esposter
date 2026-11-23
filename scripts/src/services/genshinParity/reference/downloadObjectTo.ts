import type { ReadableStream } from "node:stream/web";

import { GAME_DATA_DEV_BASE_URL } from "#src/services/gameData/constants";
import { OBJECT_DOWNLOAD_TIMEOUT_MS } from "#src/services/genshinParity/reference/constants";
import { getFileSha256 } from "#src/services/provenance/getFileSha256";
import { fetchResponse } from "#src/services/shared/fetchResponse";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { assertContentAddress, writePartialThenMove } from "@esposter/shared-node/cache";
import { createWriteStream } from "node:fs";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";

// One stored object streamed to a file, checked against its hash before it takes the file's name: a download cut short
// Or a changed object is never kept, and a recording is never held in memory whole
export const downloadObjectTo = async (key: string, destination: string, sha256: string): Promise<void> => {
  const response = await fetchResponse(`${GAME_DATA_DEV_BASE_URL}/${key}`, { timeoutMs: OBJECT_DOWNLOAD_TIMEOUT_MS });
  if (!response.ok || response.body === null)
    throw new InvalidOperationError(Operation.Read, key, `responds ${response.status}`);
  await writePartialThenMove(destination, async (partialPath) => {
    // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- the response body is the platform's stream, which Node's typings of Readable.fromWeb do not accept as their own web stream
    await pipeline(Readable.fromWeb(response.body as ReadableStream), createWriteStream(partialPath));
    assertContentAddress(key, sha256, await getFileSha256(partialPath));
  });
};
