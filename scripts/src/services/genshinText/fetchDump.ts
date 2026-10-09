import type { ContentsEntry } from "#src/models/genshinText/ContentsEntry";
import type { DumpFile } from "#src/models/genshinText/DumpFile";

import {
  ANIME_GAME_DATA_CONTENTS_URL,
  ANIME_GAME_DATA_URL,
  DUMP_FETCH_BATCH_SIZE,
  DUMP_TABLE_NAMES,
  GAME_TEXT_DIRECTORY,
  GameLanguageCodeMap,
} from "#src/services/genshinText/constants";
import { selectDumpFiles } from "#src/services/genshinText/selectDumpFiles";
import { chunk } from "@esposter/shared";
import { fetchJson } from "#src/services/shared/fetchJson";
import { fetchOk } from "#src/services/shared/fetchOk";
import { existsSync, statSync } from "node:fs";
import { mkdir, rename, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";

// A directory of the AnimeGameData repository listed as its files, each with its path from the repository root and its
// Size
const listRemoteDirectory = async (directory: string): Promise<DumpFile[]> => {
  const entries = await fetchJson<ContentsEntry[]>(`${ANIME_GAME_DATA_CONTENTS_URL}/${directory}?ref=master`);
  return entries.map(({ path, size }) => ({ path, size }));
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
// File is written beside its place and moved in, so a fetch cut short leaves no file a later run keeps
const downloadDumpFile = async ({ path }: DumpFile): Promise<void> => {
  const segments = path.split("/");
  const localPath = join(GAME_TEXT_DIRECTORY, ...segments);
  const response = await fetchOk(
    `${ANIME_GAME_DATA_URL}/${segments.map((segment) => encodeURIComponent(segment)).join("/")}`,
  );
  await mkdir(dirname(localPath), { recursive: true });
  const partialPath = `${localPath}.part`;
  await writeFile(partialPath, new Uint8Array(await response.arrayBuffer()));
  await rename(partialPath, localPath);
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
