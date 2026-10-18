import { WORLD_DATA_DIRECTORY } from "#src/services/genshinAssets/shared/constants";
import { writeJsonFile } from "#src/services/shared/writeJsonFile";
import { join } from "node:path";

// One fitted data file of the world package's, as formatted JSON, returning its path. A dry run writes nothing and
// Returns the path it would have written
export const writeWorldData = (
  relativePath: string,
  data: unknown,
  { isDryRun = false }: { isDryRun?: boolean } = {},
): Promise<string> => {
  const path = join(WORLD_DATA_DIRECTORY, relativePath);
  if (!isDryRun) writeJsonFile(path, data);
  return Promise.resolve(path);
};
