import type { DumpFile } from "#src/models/genshinText/DumpFile";

import {
  ANIME_GAME_DATA_URL,
  DUMP_FILE_DOWNLOAD_TIMEOUT_MS,
  GAME_TEXT_DIRECTORY,
} from "#src/services/genshinText/constants";
import { fetchOk } from "#src/services/shared/fetchOk";
import { publishFile } from "#src/services/shared/publishFile";
import { join } from "node:path";

// The fetch's download of every dump file the dump lacks or holds with other content, into the dump beside the others. A
// File is published through a partial file of its own, so a fetch cut short leaves no file a later run keeps
export const downloadDumpFile = async ({ path }: DumpFile): Promise<void> => {
  const segments = path.split("/");
  const localPath = join(GAME_TEXT_DIRECTORY, ...segments);
  const response = await fetchOk(
    `${ANIME_GAME_DATA_URL}/${segments.map((segment) => encodeURIComponent(segment)).join("/")}`,
    { timeoutMs: DUMP_FILE_DOWNLOAD_TIMEOUT_MS },
  );
  await publishFile(localPath, new Uint8Array(await response.arrayBuffer()));
};
