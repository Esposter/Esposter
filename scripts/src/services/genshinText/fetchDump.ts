import type { DumpedMainQuest } from "#src/models/genshinText/DumpedMainQuest";
import type { DumpedSubQuest } from "#src/models/genshinText/DumpedSubQuest";
import type { DumpFile } from "#src/models/genshinText/DumpFile";
import type { Tree } from "#src/models/genshinText/Tree";

import {
  ANIME_GAME_DATA_BRANCH,
  ANIME_GAME_DATA_TREES_URL,
  ANIME_GAME_DATA_URL,
  AVATAR_TALENT_DIRECTORY,
  BIN_OUTPUT_DIRECTORY,
  DUMP_FETCH_BATCH_SIZE,
  DUMP_FILE_DOWNLOAD_TIMEOUT_MS,
  GAME_TEXT_DIRECTORY,
  GameLanguageCodeMap,
  MAIN_QUEST_TABLE_NAME,
  QUEST_BINARY_DIRECTORY_PATH,
  SCENE_NPC_BORN_DIRECTORY,
  SCENE_NPC_BORN_FILE_NAME,
  SCENE_WORLD_AREA_DIRECTORY,
  SCENE_WORLD_AREA_FILE_NAME,
  SUB_QUEST_TABLE_NAME,
  TEXT_MAP_DIRECTORY_NAME,
} from "#src/services/genshinText/constants";
import { readCarriedQuestBinaryPaths } from "#src/services/genshinText/readCarriedQuestBinaryPaths";
import { readExcelTable } from "#src/services/genshinText/readExcelTable";
import { readGitHubHeaders } from "#src/services/genshinText/readGitHubHeaders";
import { selectDumpFiles } from "#src/services/genshinText/selectDumpFiles";
import { fetchJson } from "#src/services/shared/fetchJson";
import { fetchOk } from "#src/services/shared/fetchOk";
import { publishFile } from "#src/services/shared/publishFile";
import { chunk, InvalidOperationError, Operation } from "@esposter/shared";
import { QuestIds, ReputationRequestQuestIds } from "genshin-world";
import { existsSync, readdirSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";

// A directory of the AnimeGameData repository listed as its files, each with its path from the repository root and its
// Size. A tree the API cut short throws, so a listing is never silently missing files. The listing is authorized by
// GITHUB_TOKEN when one is set, since the API's anonymous limit is 60 requests an hour
const listRemoteDirectory = async (directory: string): Promise<DumpFile[]> => {
  const { tree, truncated } = await fetchJson<Tree>(
    `${ANIME_GAME_DATA_TREES_URL}/${ANIME_GAME_DATA_BRANCH}:${directory}`,
    readGitHubHeaders(process.env.GITHUB_TOKEN),
  );
  if (truncated) throw new InvalidOperationError(Operation.Read, directory, "its tree listing was truncated");
  return tree.flatMap(({ path, size, type }) =>
    type === "blob" && size !== undefined ? [{ path: `${directory}/${path}`, size }] : [],
  );
};

// Each BinOutput file the dump already holds, listed from its folder's remote listing. A reader names the binaries it
// Reads, a quest or a scene's points, and the fetch keeps those at the install's build rather than listing the tens of
// Thousands of the whole folder
const listHeldBinaryFiles = async (): Promise<DumpFile[]> => {
  const binaryDirectory = join(GAME_TEXT_DIRECTORY, BIN_OUTPUT_DIRECTORY);
  if (!existsSync(binaryDirectory)) return [];
  const heldPaths = new Set(
    readdirSync(binaryDirectory, { recursive: true, withFileTypes: true }).flatMap((entry) =>
      entry.isFile() ? [relative(GAME_TEXT_DIRECTORY, join(entry.parentPath, entry.name)).split(sep).join("/")] : [],
    ),
  );
  const directories = new Set(Array.from(heldPaths, (path) => path.slice(0, path.lastIndexOf("/"))));
  const listings = await Promise.all(Array.from(directories, (directory) => listRemoteDirectory(directory)));
  return listings.flat().filter(({ path }) => heldPaths.has(path));
};

// The dump's own files a fetch may refresh: the readable texts of every language's folder, every table of ExcelBinOutput
// Whole or in its numbered parts, every language's text maps, the scene's NPC births and area outlines, every talent
// Config, and each other binary the dump already holds, each at its path under the dump's folder. Everything is held at the install's build, so a
// Reader never takes a row, a text or a step from an older patch
const listDumpFiles = async (): Promise<DumpFile[]> => {
  const tableFiles = (await listRemoteDirectory("ExcelBinOutput")).filter(({ path }) => path.endsWith(".json"));
  const textMapFiles = (await listRemoteDirectory(TEXT_MAP_DIRECTORY_NAME)).filter(({ path }) =>
    path.endsWith(".json"),
  );
  const readableFiles = await Promise.all(
    Object.values(GameLanguageCodeMap).map((code) => listRemoteDirectory(`Readable/${code}`)),
  );
  const sceneFiles = await Promise.all(
    [
      { directory: SCENE_NPC_BORN_DIRECTORY, fileName: SCENE_NPC_BORN_FILE_NAME },
      { directory: SCENE_WORLD_AREA_DIRECTORY, fileName: SCENE_WORLD_AREA_FILE_NAME },
    ].map(async ({ directory, fileName }) =>
      (await listRemoteDirectory(directory)).filter(({ path }) => path === `${directory}/${fileName}`),
    ),
  );
  const talentFiles = (await listRemoteDirectory(AVATAR_TALENT_DIRECTORY)).filter(({ path }) => path.endsWith(".json"));
  const heldBinaryFiles = await listHeldBinaryFiles();
  // A held binary is also a scene file or a talent config, each listed once
  return [
    ...new Map(
      [
        ...tableFiles,
        ...textMapFiles,
        ...readableFiles.flat(),
        ...sceneFiles.flat(),
        ...talentFiles,
        ...heldBinaryFiles,
      ].map((file) => [file.path, file]),
    ).values(),
  ];
};

// The fetch's download of every dump file the dump lacks or holds at another size, into the dump beside the others. A
// File is published through a partial file of its own, so a fetch cut short leaves no file a later run keeps
const downloadDumpFile = async ({ path }: DumpFile): Promise<void> => {
  const segments = path.split("/");
  const localPath = join(GAME_TEXT_DIRECTORY, ...segments);
  const response = await fetchOk(
    `${ANIME_GAME_DATA_URL}/${segments.map((segment) => encodeURIComponent(segment)).join("/")}`,
    { timeoutMs: DUMP_FILE_DOWNLOAD_TIMEOUT_MS },
  );
  await publishFile(localPath, new Uint8Array(await response.arrayBuffer()));
};

// Downloads each of the remote files the dump lacks or holds at another size, and returns the count fetched and the count
// Kept
const fetchRemoteFiles = async (remoteFiles: readonly DumpFile[]): Promise<{ fetched: number; held: number }> => {
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
  return { fetched: selectedFiles.length, held: remoteFiles.length - selectedFiles.length };
};

// The binary each quest the reader carries reads, listed from its folder. The main and sub quest tables it is named by
// Are the ones the first pass brought down, so this runs after it. A binary the folder lacks is named in the error
const listCarriedQuestBinaryFiles = async (): Promise<DumpFile[]> => {
  const requestedPaths = new Set(
    readCarriedQuestBinaryPaths(
      QuestIds.filter((questId) => !ReputationRequestQuestIds.includes(questId)),
      readExcelTable<DumpedMainQuest>(MAIN_QUEST_TABLE_NAME),
      readExcelTable<DumpedSubQuest>(SUB_QUEST_TABLE_NAME),
    ),
  );
  const listedFiles = await listRemoteDirectory(QUEST_BINARY_DIRECTORY_PATH);
  const listedPaths = new Set(listedFiles.map(({ path }) => path));
  const missingPaths = [...requestedPaths].filter((path) => !listedPaths.has(path));
  if (missingPaths.length > 0)
    throw new InvalidOperationError(
      Operation.Read,
      QUEST_BINARY_DIRECTORY_PATH,
      `has no binary for ${missingPaths.join(", ")} in AnimeGameData`,
    );
  return listedFiles.filter(({ path }) => requestedPaths.has(path));
};

// Every readable text, table, text map and held binary the dump lacks, or holds at another size, and each binary a carried
// Quest reads, fetched from AnimeGameData. Returns a note of the count fetched and the count kept
export const fetchDump = async (): Promise<string[]> => {
  const dumpFiles = await fetchRemoteFiles(await listDumpFiles());
  const questFiles = await fetchRemoteFiles(await listCarriedQuestBinaryFiles());
  return [
    `${dumpFiles.fetched + questFiles.fetched} dump files fetched, ${dumpFiles.held + questFiles.held} already held`,
  ];
};
