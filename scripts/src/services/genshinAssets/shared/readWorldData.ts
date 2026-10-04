import { WORLD_DATA_DIRECTORY } from "#src/services/genshinAssets/shared/constants";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

// One fitted data file of the world package's, as `fit` wrote it
export const readWorldData = async <T>(relativePath: string): Promise<T> =>
  parseMachineJson<T>(await readFile(join(WORLD_DATA_DIRECTORY, relativePath), "utf8"));
