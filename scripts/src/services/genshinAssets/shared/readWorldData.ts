import { readGameDataLock } from "#src/services/gameData/readGameDataLock";
import { readPublishedGameDataObject } from "#src/services/gameData/readPublishedGameDataObject";
import { WORLD_DATA_DIRECTORY } from "#src/services/genshinAssets/shared/constants";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

// One data file of the world package's: the record the lock names under its path less `.json`, which is what a fit or a
// Parity loop last published, else the file the package keeps (region data and the authored sources no fit publishes)
export const readWorldData = async <T>(relativePath: string): Promise<T> => {
  const key = relativePath.replace(/\.json$/u, "");
  const hash = (await readGameDataLock()).objects[key];
  if (hash !== undefined) return readPublishedGameDataObject<T>(key, hash);
  return parseMachineJson<T>(await readFile(join(WORLD_DATA_DIRECTORY, relativePath), "utf8"));
};
