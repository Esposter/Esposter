import { readPublishedGameData } from "#src/services/gameData/readPublishedGameData";
import { WORLD_DATA_DIRECTORY } from "#src/services/genshinAssets/shared/constants";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

// One fitted data file of the world package's: the file the package keeps (region data, authored sources, and every fit
// That still writes its file, whose last write is the freshest), else the record the lock names under its path less
// `.json` once the file is published and gone
export const readWorldData = async <T>(relativePath: string): Promise<T> => {
  const path = join(WORLD_DATA_DIRECTORY, relativePath);
  if (existsSync(path)) return parseMachineJson<T>(await readFile(path, "utf8"));
  return readPublishedGameData<T>(relativePath.replace(/\.json$/u, ""));
};
