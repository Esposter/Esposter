import { readGameDataLock } from "#src/services/gameData/readGameDataLock";
import { readPublishedGameData } from "#src/services/gameData/readPublishedGameData";
import { collectNameTextIds } from "#src/services/genshinText/collectNameTextIds";
import { PUBLISHED_READ_BATCH_SIZE, TEXT_GAME_DATASETS } from "#src/services/genshinText/constants";
import { toDataFileKey } from "#src/services/genshinText/toDataFileKey";
import { walkJsonFiles } from "#src/services/genshinText/walkJsonFiles";
import { WORLD_DATA_DIRECTORY } from "#src/services/shared/constants";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { chunk, takeOne } from "@esposter/shared";
import { HOSTED_RECORD_EXTENSION } from "hosted-assets";
import { readFileSync } from "node:fs";

// The text id of every name and description the world's data cites: every published JSON record outside the text
// Datasets, and every data file the lock does not name, which the package still keeps. A new source needs no edit here.
// The lock's extension says which objects are records: a recording (`.ogg`) is an object too, and parsing its bytes as
// JSON fails
export const readNameTextIds = async (): Promise<string[]> => {
  const { objects } = await readGameDataLock();
  const textIds = new Set<string>();
  const publishedKeys = Object.entries(objects)
    .filter(
      ([key, { extension }]) =>
        extension === HOSTED_RECORD_EXTENSION && !TEXT_GAME_DATASETS.includes(takeOne(key.split("/"))),
    )
    .map(([key]) => key);
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
