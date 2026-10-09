import { readGameDataLock } from "#src/services/gameData/readGameDataLock";
import { readPublishedGameData } from "#src/services/gameData/readPublishedGameData";
import { WORLD_DATA_DIRECTORY } from "#src/services/genshinAssets/shared/constants";
import { PUBLISHED_READ_BATCH_SIZE, TEXT_GAME_DATASETS } from "#src/services/genshinText/constants";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { chunk, takeOne } from "@esposter/shared";
import { readdirSync, readFileSync } from "node:fs";
import { join, relative, sep } from "node:path";

// Every JSON file under `directory` at any depth
const walkJsonFiles = (directory: string): string[] =>
  readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return walkJsonFiles(path);
    return entry.name.endsWith(".json") ? [path] : [];
  });

// Adds the `nameTextId` of every row at any depth, so a nested one is found the same as a top-level one
const collectNameTextIds = (value: unknown, textIds: Set<string>): void => {
  if (Array.isArray(value)) {
    for (const item of value) collectNameTextIds(item, textIds);
    return;
  }
  if (!value || typeof value !== "object") return;
  for (const [key, child] of Object.entries(value))
    if (key === "nameTextId") textIds.add(String(child));
    else collectNameTextIds(child, textIds);
};

// The data file's key in the lock: its path under the data folder, with '/' separators and without `.json`
const toDataFileKey = (path: string): string =>
  relative(WORLD_DATA_DIRECTORY, path)
    .split(sep)
    .join("/")
    .replace(/\.json$/u, "");

// The text id of every name the world's data cites: every published record outside the text datasets, and every data file
// The lock does not name, which the package still keeps. A new source needs no edit here
export const readNameTextIds = async (): Promise<string[]> => {
  const { objects } = await readGameDataLock();
  const textIds = new Set<string>();
  const publishedKeys = Object.keys(objects).filter((key) => !TEXT_GAME_DATASETS.includes(takeOne(key.split("/"))));
  const publishedValues = await chunk(publishedKeys, PUBLISHED_READ_BATCH_SIZE).reduce(
    async (previousValues, batch) => [
      ...(await previousValues),
      ...(await Promise.all(batch.map((key) => readPublishedGameData<unknown>(key)))),
    ],
    Promise.resolve<unknown[]>([]),
  );
  for (const publishedValue of publishedValues) collectNameTextIds(publishedValue, textIds);
  for (const path of walkJsonFiles(WORLD_DATA_DIRECTORY))
    if (!Object.hasOwn(objects, toDataFileKey(path)))
      collectNameTextIds(parseMachineJson(readFileSync(path, "utf8")), textIds);
  return [...textIds].toSorted();
};
