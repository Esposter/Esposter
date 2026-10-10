import { WORLD_DATA_DIRECTORY } from "#src/services/genshinAssets/shared/constants";
import { writeJsonFile } from "#src/services/shared/writeJsonFile";
import { join } from "node:path";

// One fitted data file of the world package's, as formatted JSON, returning its path
export const writeWorldData = (relativePath: string, data: unknown): Promise<string> => {
  const path = join(WORLD_DATA_DIRECTORY, relativePath);
  writeJsonFile(path, data);
  return Promise.resolve(path);
};
