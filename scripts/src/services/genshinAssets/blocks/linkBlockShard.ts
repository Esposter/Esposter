import type { BlockFile } from "#src/models/genshinAssets/shared/BlockFile";

import { mkdir, rm, symlink } from "node:fs/promises";
import { dirname, join } from "node:path";

// A shard's own blocks folder: each of its files symlinked where it stands in the game's blocks, so AnimeStudio reads it
// As the game's, its CAB map's paths relative to this folder are the game's own, and no block is copied
export const linkBlockShard = async (files: BlockFile[], source: string, destination: string): Promise<void> => {
  await rm(destination, { force: true, recursive: true });
  await Promise.all(
    files.map(async ({ path }) => {
      const link = join(destination, path);
      await mkdir(dirname(link), { recursive: true });
      await symlink(join(source, path), link);
    }),
  );
};
