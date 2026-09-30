import { WORLD_DATA_DIRECTORY } from "#src/services/genshinAssets/constants";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";

// One fitted data file of the world package's, as formatted JSON, returning its path
export const writeWorldData = async (relativePath: string, data: unknown): Promise<string> => {
  const path = join(WORLD_DATA_DIRECTORY, relativePath);
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, `${JSON.stringify(data, null, 2)}\n`);
  return path;
};
