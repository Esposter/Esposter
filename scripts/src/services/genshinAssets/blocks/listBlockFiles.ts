import type { BlockFile } from "#src/models/genshinAssets/shared/BlockFile";

import { readdir, stat } from "node:fs/promises";
import { join } from "node:path";

// Every file under the blocks folder, by its path relative to it, in path order: the order the map's shards are cut
// From and merged in, so the same blocks always cut the same way
export const listBlockFiles = async (directory: string): Promise<BlockFile[]> => {
  const paths = (await readdir(directory, { recursive: true })).map((path) => path.replaceAll("\\", "/")).toSorted();
  const files = await Promise.all(
    paths.map(async (path): Promise<BlockFile | undefined> => {
      const entry = await stat(join(directory, path));
      return entry.isFile() ? { path, size: entry.size } : undefined;
    }),
  );
  return files.filter((file) => file !== undefined);
};
