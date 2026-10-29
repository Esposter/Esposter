import type { DumpFile } from "#src/models/genshinText/DumpFile";

import { DUMP_FETCH_BATCH_SIZE, GAME_TEXT_DIRECTORY } from "#src/services/genshinText/constants";
import { downloadDumpFile } from "#src/services/genshinText/downloadDumpFile";
import { getGitBlobSha } from "#src/services/genshinText/getGitBlobSha";
import { selectDumpFiles } from "#src/services/genshinText/selectDumpFiles";
import { chunk } from "@esposter/shared";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

// Downloads each of the remote files the dump lacks or holds with other content, and returns the count fetched and the
// Count kept
export const fetchRemoteFiles = async (
  remoteFiles: readonly DumpFile[],
): Promise<{ fetched: number; held: number }> => {
  const localShaMap = new Map(
    remoteFiles.flatMap(({ path }) => {
      const localPath = join(GAME_TEXT_DIRECTORY, ...path.split("/"));
      return existsSync(localPath) ? [[path, getGitBlobSha(readFileSync(localPath))] as const] : [];
    }),
  );
  const selectedFiles = selectDumpFiles(remoteFiles, localShaMap);
  // The batches run one after another, so a fetch of thousands of files does not open them all at once
  await chunk(selectedFiles, DUMP_FETCH_BATCH_SIZE).reduce(async (previousBatch, batch) => {
    await previousBatch;
    await Promise.all(batch.map((file) => downloadDumpFile(file)));
  }, Promise.resolve());
  return { fetched: selectedFiles.length, held: remoteFiles.length - selectedFiles.length };
};
