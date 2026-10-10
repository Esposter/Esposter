import type { DumpFile } from "#src/models/genshinText/DumpFile";
import type { Tree } from "#src/models/genshinText/Tree";

import {
  ANIME_GAME_DATA_BRANCH,
  ANIME_GAME_DATA_TREES_URL,
  ANIME_GAME_DATA_URL,
  DUMP_FETCH_BATCH_SIZE,
  DUMP_TABLE_NAMES,
  GAME_TEXT_DIRECTORY,
  GameLanguageCodeMap,
} from "#src/services/genshinText/constants";
import { selectDumpFiles } from "#src/services/genshinText/selectDumpFiles";
import { fetchJson } from "#src/services/shared/fetchJson";
import { fetchOk } from "#src/services/shared/fetchOk";
import { publishFile } from "#src/services/shared/publishFile";
import { chunk, InvalidOperationError, Operation } from "@esposter/shared";
import { existsSync, statSync } from "node:fs";
import { join } from "node:path";

// A directory of the AnimeGameData repository listed as its files, each with its path from the repository root and its
// Size. A tree the API cut short throws, so a listing is never silently missing files
const listRemoteDirectory = async (directory: string): Promise<DumpFile[]> => {
  const { tree, truncated } = await fetchJson<Tree>(
    `${ANIME_GAME_DATA_TREES_URL}/${ANIME_GAME_DATA_BRANCH}:${directory}`,
  );
  if (truncated) throw new InvalidOperationError(Operation.Read, directory, "its tree listing was truncated");
  return tree.flatMap(({ path, size, type }) =>
    type === "blob" && size !== undefined ? [{ path: `${directory}/${path}`, size }] : [],
  );
};

// The dump's own files a fetch may add: the readable texts of every language's folder and the tables a reader names,
// Each at its path under the dump's folder
const listDumpFiles = async (): Promise<DumpFile[]> => {
  const tableFiles = (await listRemoteDirectory("ExcelBinOutput")).filter(({ path }) =>
    DUMP_TABLE_NAMES.some((tableName) => path === `ExcelBinOutput/${tableName}.json`),
  );
  const readableFiles = await Promise.all(
    Object.values(GameLanguageCodeMap).map((code) => listRemoteDirectory(`Readable/${code}`)),
  );
  return [...tableFiles, ...readableFiles.flat()];
};

// The fetch's download of every dump file the dump lacks or holds at another size, into the dump beside the others. A
// File is published through a partial file of its own, so a fetch cut short leaves no file a later run keeps
const downloadDumpFile = async ({ path }: DumpFile): Promise<void> => {
  const segments = path.split("/");
  const localPath = join(GAME_TEXT_DIRECTORY, ...segments);
  const response = await fetchOk(
    `${ANIME_GAME_DATA_URL}/${segments.map((segment) => encodeURIComponent(segment)).join("/")}`,
  );
  await publishFile(localPath, new Uint8Array(await response.arrayBuffer()));
};

// Every readable text and table the dump lacks, or holds at another size, fetched from AnimeGameData. Returns a note of
// The count fetched and the count kept
export const fetchDump = async (): Promise<string[]> => {
  const remoteFiles = await listDumpFiles();
  const localSizeMap = new Map(
    remoteFiles.flatMap(({ path }) => {
      const localPath = join(GAME_TEXT_DIRECTORY, ...path.split("/"));
      return existsSync(localPath) ? [[path, statSync(localPath).size] as const] : [];
    }),
  );
  const selectedFiles = selectDumpFiles(remoteFiles, localSizeMap);
  // The batches run one after another, so a fetch of thousands of files does not open them all at once
  await chunk(selectedFiles, DUMP_FETCH_BATCH_SIZE).reduce(async (previousBatch, batch) => {
    await previousBatch;
    await Promise.all(batch.map((file) => downloadDumpFile(file)));
  }, Promise.resolve());
  return [`${selectedFiles.length} dump files fetched, ${remoteFiles.length - selectedFiles.length} already held`];
};
